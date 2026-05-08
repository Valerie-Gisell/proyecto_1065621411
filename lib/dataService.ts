import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import { getSeedCategories, getSeedUsers, SeedCategory, SeedUser } from "@/lib/seedReader";
import { appendAuditEntry } from "@/lib/blobAudit";
import type {
  Category,
  CategoryBreakdown,
  ContributeGoalRequest,
  CreateCategoryRequest,
  CreateGoalRequest,
  CreateTransactionRequest,
  CreateUserRequest,
  DashboardData,
  DailyBalance,
  EmotionAnalysis,
  Goal,
  GoalContribution,
  GoalWithProgress,
  MonthlyBalance,
  Transaction,
  TransactionFilters,
  UpdateCategoryRequest,
  UpdateGoalRequest,
  UpdateTransactionRequest,
  UpdateUserRequest,
  User,
} from "@/lib/types";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const CATEGORIES_FILE = path.join(process.cwd(), "data", "categories.json");
const TRANSACTIONS_FILE = path.join(process.cwd(), "data", "transactions.json");
const GOALS_FILE = path.join(process.cwd(), "data", "goals.json");
const GOAL_CONTRIBUTIONS_FILE = path.join(process.cwd(), "data", "goal_contributions.json");

type StoredUser = User & { passwordHash?: string };
type StoredCategory = Category;
type StoredTransaction = Transaction;

function ensureFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
  }
}

function readJsonFile<T>(filePath: string): T[] {
  ensureFile(filePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

function writeJsonFile<T>(filePath: string, content: T[]) {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildSafeUser(user: User): User {
  const { passwordHash, ...safe } = user as User & { passwordHash?: string };
  return safe;
}

function buildUserFromSeed(seed: SeedUser): User {
  return {
    id: seed.id,
    name: seed.name,
    email: normalizeEmail(seed.email),
    role: seed.role,
    currency: seed.currency || "COP",
    is_active: seed.is_active ?? true,
    must_change_password: seed.must_change_password ?? false,
    created_at: seed.created_at ?? new Date().toISOString(),
  };
}

function buildCategoryFromSeed(seed: SeedCategory): Category {
  return {
    id: seed.id,
    user_id: seed.user_id,
    name: seed.name,
    emoji: seed.emoji,
    color: seed.color,
    type: seed.type,
    is_active: seed.is_active,
    created_at: seed.created_at,
  };
}

function getLocalUsers(): StoredUser[] {
  ensureFile(USERS_FILE);
  return readJsonFile<StoredUser>(USERS_FILE);
}

function saveLocalUsers(users: StoredUser[]) {
  writeJsonFile(USERS_FILE, users);
}

function getLocalCategories(): StoredCategory[] {
  ensureFile(CATEGORIES_FILE);
  return readJsonFile<StoredCategory>(CATEGORIES_FILE);
}

function saveLocalCategories(categories: StoredCategory[]) {
  writeJsonFile(CATEGORIES_FILE, categories);
}

function getLocalTransactions(): StoredTransaction[] {
  ensureFile(TRANSACTIONS_FILE);
  return readJsonFile<StoredTransaction>(TRANSACTIONS_FILE);
}

function saveLocalTransactions(transactions: StoredTransaction[]) {
  writeJsonFile(TRANSACTIONS_FILE, transactions);
}

function getLocalGoals(): Goal[] {
  ensureFile(GOALS_FILE);
  return readJsonFile<Goal>(GOALS_FILE);
}

function saveLocalGoals(goals: Goal[]) {
  writeJsonFile(GOALS_FILE, goals);
}

function getLocalGoalContributions(): GoalContribution[] {
  ensureFile(GOAL_CONTRIBUTIONS_FILE);
  return readJsonFile<GoalContribution>(GOAL_CONTRIBUTIONS_FILE);
}

function saveLocalGoalContributions(contributions: GoalContribution[]) {
  writeJsonFile(GOAL_CONTRIBUTIONS_FILE, contributions);
}

function isSameCategoryName(existing: Category, name: string, userId: string) {
  return (
    existing.name.trim().toLowerCase() === name.trim().toLowerCase() &&
    (existing.user_id === null || existing.user_id === userId)
  );
}

function parseDate(value: string) {
  return new Date(value + "T00:00:00.000Z");
}

export async function getSystemMode(): Promise<"seed" | "live"> {
  return isSupabaseEnabled() ? "live" : "seed";
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = normalizeEmail(email);

  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,currency,is_active,must_change_password,created_at")
      .eq("email", normalized)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  const seedUser = getSeedUsers().find((user) => normalizeEmail(user.email) === normalized);
  if (seedUser) {
    return buildUserFromSeed(seedUser);
  }

  const users = getLocalUsers();
  return users.find((user) => user.email === normalized) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,currency,is_active,must_change_password,created_at")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  const seedUser = getSeedUsers().find((user) => user.id === id);
  if (seedUser) {
    return buildUserFromSeed(seedUser);
  }

  const users = getLocalUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  if (typeof (user as any).passwordHash === "string") {
    return bcrypt.compare(password, (user as any).passwordHash);
  }

  const seedUser = getSeedUsers().find((entry) => entry.email.toLowerCase() === user.email.toLowerCase());
  if (seedUser?.password) {
    return seedUser.password === password;
  }

  return false;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const normalizedEmail = normalizeEmail(data.email);
  if (await getUserByEmail(normalizedEmail)) {
    throw new Error("Ya existe un usuario con ese correo electrónico.");
  }

  const passwordHash = bcrypt.hashSync(data.password, 10);
  const newUser: User = {
    id: crypto.randomUUID(),
    name: data.name,
    email: normalizedEmail,
    role: data.role ?? "usuario",
    currency: data.currency ?? "COP",
    is_active: true,
    must_change_password: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("users").insert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password_hash: passwordHash,
      role: newUser.role,
      currency: newUser.currency,
      is_active: true,
      must_change_password: false,
    });
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo crear el usuario en Supabase.");
    }
    appendAuditEntry({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: newUser.id,
      user_email: newUser.email,
      user_role: newUser.role,
      action: "register",
      entity: "user",
      entity_id: newUser.id,
      summary: "Registro de usuario público en modo live.",
    });
    return newUser;
  }

  const users = getLocalUsers();
  saveLocalUsers([...users, { ...newUser, passwordHash } as StoredUser]);

  appendAuditEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: newUser.id,
    user_email: newUser.email,
    user_role: newUser.role,
    action: "register",
    entity: "user",
    entity_id: newUser.id,
    summary: "Registro de usuario público en modo seed.",
  });

  return newUser;
}

export async function listUsers(): Promise<User[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,currency,is_active,must_change_password,created_at");

    if (error || !data) return [];
    return data as User[];
  }

  const seedUsers = getSeedUsers().map(buildUserFromSeed);
  const users = getLocalUsers();
  return [...seedUsers, ...users.map(buildSafeUser)];
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  if (isSupabaseEnabled() && supabase) {
    const updates: any = { ...data, updated_at: new Date().toISOString() };
    if (data.password) {
      updates.password_hash = bcrypt.hashSync(data.password, 10);
      delete updates.password;
    }

    const { data: result, error } = await supabase.from("users").update(updates).eq("id", id).single();
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo actualizar el usuario en Supabase.");
    }
    return result as User;
  }

  const users = getLocalUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    throw new Error("Usuario no encontrado.");
  }

  if (data.password) {
    (users[index] as StoredUser).passwordHash = bcrypt.hashSync(data.password, 10);
  }

  users[index] = {
    ...users[index],
    ...data,
  } as StoredUser;
  saveLocalUsers(users);
  return buildSafeUser(users[index]);
}

export async function getCategories(userId: string): Promise<Category[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("id,user_id,name,emoji,color,type,is_active,created_at")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq("is_active", true);

    if (error || !data) return [];
    return data as Category[];
  }

  const seedCategories = getSeedCategories().map(buildCategoryFromSeed);
  const localCategories = getLocalCategories().filter(
    (category) => category.user_id === null || category.user_id === userId
  );
  return [...seedCategories, ...localCategories];
}

export async function getGlobalCategories(): Promise<Category[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("id,user_id,name,emoji,color,type,is_active,created_at")
      .is("user_id", null)
      .eq("is_active", true);

    if (error || !data) return [];
    return data as Category[];
  }

  const seedCategories = getSeedCategories().map(buildCategoryFromSeed);
  const localCategories = getLocalCategories().filter((category) => category.user_id === null);
  return [...seedCategories, ...localCategories];
}

export async function createCategory(userId: string, data: CreateCategoryRequest): Promise<Category> {
  if (await getUserById(userId) === null) {
    throw new Error("Usuario no encontrado.");
  }

  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("categories").insert({
      user_id: userId,
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      type: data.type,
      is_active: true,
    });
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo crear la categoría en Supabase.");
    }
    const category = result[0] as Category;
    appendAuditEntry({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: userId,
      action: "create_category",
      entity: "category",
      entity_id: category.id,
      summary: `Categoría personal creada: ${category.name}`,
    });
    return category;
  }

  const seedCategories = getSeedCategories().map(buildCategoryFromSeed);
  const localCategories = getLocalCategories();
  const duplicate = [...seedCategories, ...localCategories].find((category) =>
    isSameCategoryName(category, data.name, userId)
  );
  if (duplicate) {
    throw new Error("Ya existe una categoría con ese nombre.");
  }

  const category: Category = {
    id: crypto.randomUUID(),
    user_id: userId,
    name: data.name,
    emoji: data.emoji,
    color: data.color,
    type: data.type,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  saveLocalCategories([...localCategories, category]);
  appendAuditEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    action: "create_category",
    entity: "category",
    entity_id: category.id,
    summary: `Categoría personal creada: ${category.name}`,
  });
  return category;
}

export async function updateCategory(id: string, userId: string, data: UpdateCategoryRequest): Promise<Category> {
  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase
      .from("categories")
      .update({ ...data })
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo actualizar la categoría en Supabase.");
    }
    const category = result as Category;
    appendAuditEntry({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: userId,
      action: "update_category",
      entity: "category",
      entity_id: category.id,
      summary: `Categoría actualizada: ${category.name}`,
    });
    return category;
  }

  const categories = getLocalCategories();
  const index = categories.findIndex((category) => category.id === id && category.user_id === userId);
  if (index === -1) {
    throw new Error("Categoría no encontrada o no permitida.");
  }

  const updated = { ...categories[index], ...data } as Category;
  categories[index] = updated;
  saveLocalCategories(categories);

  appendAuditEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    action: "update_category",
    entity: "category",
    entity_id: updated.id,
    summary: `Categoría actualizada: ${updated.name}`,
  });

  return updated;
}

export async function deleteCategory(id: string, userId: string): Promise<void> {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      throw new Error(error.message);
    }
    appendAuditEntry({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: userId,
      action: "delete_category",
      entity: "category",
      entity_id: id,
      summary: `Categoría eliminada: ${id}`,
    });
    return;
  }

  const transactions = getLocalTransactions();
  const attached = transactions.some((transaction) => transaction.category_id === id && transaction.user_id === userId);
  if (attached) {
    throw new Error("No se puede eliminar una categoría que tiene transacciones asociadas.");
  }

  const categories = getLocalCategories();
  const next = categories.filter((category) => !(category.id === id && category.user_id === userId));
  if (next.length === categories.length) {
    throw new Error("Categoría no encontrada.");
  }

  saveLocalCategories(next);
  appendAuditEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    action: "delete_category",
    entity: "category",
    entity_id: id,
    summary: `Categoría eliminada: ${id}`,
  });
}

export async function createGlobalCategory(data: CreateCategoryRequest): Promise<Category> {
  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("categories").insert({
      user_id: null,
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      type: data.type,
      is_active: true,
    });
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo crear la categoría global en Supabase.");
    }
    return result[0] as Category;
  }

  const categories = getLocalCategories();
  const duplicate = categories.find((category) => category.user_id === null && category.name.trim().toLowerCase() === data.name.trim().toLowerCase());
  if (duplicate) {
    throw new Error("Ya existe una categoría global con ese nombre.");
  }

  const category: Category = {
    id: crypto.randomUUID(),
    user_id: null,
    name: data.name,
    emoji: data.emoji,
    color: data.color,
    type: data.type,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  saveLocalCategories([...categories, category]);
  return category;
}

export async function updateGlobalCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("categories").update({ ...data }).eq("id", id).is("user_id", null).single();
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo actualizar la categoría global en Supabase.");
    }
    return result as Category;
  }

  const categories = getLocalCategories();
  const index = categories.findIndex((category) => category.id === id && category.user_id === null);
  if (index === -1) {
    throw new Error("Categoría global no encontrada.");
  }
  categories[index] = { ...categories[index], ...data } as Category;
  saveLocalCategories(categories);
  return categories[index];
}

export async function deleteGlobalCategory(id: string): Promise<void> {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("categories").delete().eq("id", id).is("user_id", null);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const transactions = getLocalTransactions();
  const attached = transactions.some((transaction) => transaction.category_id === id);
  if (attached) {
    throw new Error("No se puede eliminar una categoría global con transacciones asociadas.");
  }

  const categories = getLocalCategories();
  const next = categories.filter((category) => !(category.id === id && category.user_id === null));
  if (next.length === categories.length) {
    throw new Error("Categoría global no encontrada.");
  }

  saveLocalCategories(next);
}

export async function getTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
  if (isSupabaseEnabled() && supabase) {
    let query = supabase.from("transactions").select("*").eq("user_id", userId);
    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.category_id) query = query.eq("category_id", filters.category_id);
    if (filters?.emotion) query = query.eq("emotion", filters.emotion);
    if (filters?.from) query = query.gte("transaction_date", filters.from);
    if (filters?.to) query = query.lte("transaction_date", filters.to);
    const { data, error } = await query.order("transaction_date", { ascending: false });
    if (error || !data) return [];
    return data as Transaction[];
  }

  let transactions = getLocalTransactions().filter((transaction) => transaction.user_id === userId);
  if (filters?.type) {
    transactions = transactions.filter((transaction) => transaction.type === filters.type);
  }
  if (filters?.category_id) {
    transactions = transactions.filter((transaction) => transaction.category_id === filters.category_id);
  }
  if (filters?.emotion) {
    transactions = transactions.filter((transaction) => transaction.emotion === filters.emotion);
  }
  if (filters?.from) {
    transactions = transactions.filter((transaction) => parseDate(transaction.transaction_date) >= parseDate(filters.from));
  }
  if (filters?.to) {
    transactions = transactions.filter((transaction) => parseDate(transaction.transaction_date) <= parseDate(filters.to));
  }

  return transactions.sort((a, b) => (a.transaction_date > b.transaction_date ? -1 : 1));
}

export async function getTransactionById(id: string, userId: string): Promise<Transaction | null> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase.from("transactions").select("*").eq("id", id).eq("user_id", userId).single();
    if (error || !data) return null;
    return data as Transaction;
  }

  const transaction = getLocalTransactions().find((transaction) => transaction.id === id && transaction.user_id === userId);
  return transaction ?? null;
}

export async function createTransaction(userId: string, data: CreateTransactionRequest): Promise<Transaction> {
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    user_id: userId,
    category_id: data.category_id ?? null,
    type: data.type,
    amount: data.amount,
    description: data.description,
    transaction_date: data.transaction_date,
    emotion: data.emotion ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("transactions").insert(transaction);
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo crear la transacción en Supabase.");
    }
    appendAuditEntry({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: userId,
      action: "create_transaction",
      entity: "category",
      entity_id: transaction.id,
      summary: `Transacción creada: ${transaction.type} ${transaction.amount}`,
    });
    return result[0] as Transaction;
  }

  const transactions = getLocalTransactions();
  saveLocalTransactions([...transactions, transaction]);
  appendAuditEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    action: "create_transaction",
    entity: "category",
    entity_id: transaction.id,
    summary: `Transacción creada: ${transaction.type} ${transaction.amount}`,
  });
  return transaction;
}

export async function updateTransaction(id: string, userId: string, data: UpdateTransactionRequest): Promise<Transaction> {
  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("transactions").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).single();
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo actualizar la transacción en Supabase.");
    }
    return result as Transaction;
  }

  const transactions = getLocalTransactions();
  const index = transactions.findIndex((transaction) => transaction.id === id && transaction.user_id === userId);
  if (index === -1) {
    throw new Error("Transacción no encontrada.");
  }

  transactions[index] = {
    ...transactions[index],
    ...data,
    updated_at: new Date().toISOString(),
  } as Transaction;
  saveLocalTransactions(transactions);
  return transactions[index];
}

export async function deleteTransaction(id: string, userId: string): Promise<void> {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const transactions = getLocalTransactions();
  const next = transactions.filter((transaction) => !(transaction.id === id && transaction.user_id === userId));
  if (next.length === transactions.length) {
    throw new Error("Transacción no encontrada.");
  }
  saveLocalTransactions(next);
}

export async function getGoals(userId: string): Promise<GoalWithProgress[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((goal: Goal) => {
      const progress = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
      return {
        ...goal,
        progress: Number(progress.toFixed(1)),
        remaining: Math.max(goal.target_amount - goal.current_amount, 0),
        completed: goal.status === "completada",
      };
    }) as GoalWithProgress[];
  }

  return getLocalGoals()
    .filter((goal) => goal.user_id === userId)
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
    .map((goal) => {
      const progress = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
      return {
        ...goal,
        progress: Number(progress.toFixed(1)),
        remaining: Math.max(goal.target_amount - goal.current_amount, 0),
        completed: goal.status === "completada",
      };
    });
}

export async function getGoalById(id: string, userId: string): Promise<Goal | null> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase.from("goals").select("*").eq("id", id).eq("user_id", userId).single();
    if (error || !data) return null;
    return data as Goal;
  }

  const goal = getLocalGoals().find((goal) => goal.id === id && goal.user_id === userId);
  return goal ?? null;
}

export async function createGoal(userId: string, data: CreateGoalRequest): Promise<Goal> {
  const goal: Goal = {
    id: crypto.randomUUID(),
    user_id: userId,
    name: data.name,
    emoji: data.emoji,
    target_amount: data.target_amount,
    current_amount: 0,
    deadline: data.deadline ?? null,
    description: data.description ?? "",
    status: "pendiente",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("goals").insert(goal);
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo crear la meta en Supabase.");
    }
    appendAuditEntry({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: userId,
      action: "create_goal",
      entity: "goal",
      entity_id: goal.id,
      summary: `Meta creada: ${goal.name} ${goal.target_amount}`,
    });
    return result[0] as Goal;
  }

  const goals = getLocalGoals();
  saveLocalGoals([...goals, goal]);
  appendAuditEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    action: "create_goal",
    entity: "goal",
    entity_id: goal.id,
    summary: `Meta creada: ${goal.name} ${goal.target_amount}`,
  });
  return goal;
}

export async function updateGoal(id: string, userId: string, data: UpdateGoalRequest): Promise<Goal> {
  if (isSupabaseEnabled() && supabase) {
    const { data: result, error } = await supabase.from("goals").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).single();
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo actualizar la meta en Supabase.");
    }
    return result as Goal;
  }

  const goals = getLocalGoals();
  const index = goals.findIndex((goal) => goal.id === id && goal.user_id === userId);
  if (index === -1) {
    throw new Error("Meta no encontrada.");
  }

  goals[index] = {
    ...goals[index],
    ...data,
    deadline: data.deadline === undefined ? goals[index].deadline : data.deadline,
    updated_at: new Date().toISOString(),
  } as Goal;
  saveLocalGoals(goals);
  return goals[index];
}

export async function deleteGoal(id: string, userId: string): Promise<void> {
  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const goals = getLocalGoals();
  const next = goals.filter((goal) => !(goal.id === id && goal.user_id === userId));
  if (next.length === goals.length) {
    throw new Error("Meta no encontrada.");
  }
  saveLocalGoals(next);
}

export async function contributeToGoal(id: string, userId: string, data: ContributeGoalRequest): Promise<Goal> {
  if (isSupabaseEnabled() && supabase) {
    const { data: currentGoal, error: fetchError } = await supabase.from("goals").select("*").eq("id", id).eq("user_id", userId).single();
    if (fetchError || !currentGoal) {
      throw new Error(fetchError?.message ?? "Meta no encontrada.");
    }

    const updatedGoal: Goal = {
      ...currentGoal,
      current_amount: Number(currentGoal.current_amount ?? 0) + data.amount,
      status: Number(currentGoal.current_amount ?? 0) + data.amount >= Number(currentGoal.target_amount)
        ? "completada"
        : currentGoal.status,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase.from("goals").update(updatedGoal).eq("id", id).eq("user_id", userId).single();
    if (error || !result) {
      throw new Error(error?.message ?? "No se pudo contribuir a la meta en Supabase.");
    }

    await recordGoalContribution(id, userId, data.amount);
    return result as Goal;
  }

  const goals = getLocalGoals();
  const index = goals.findIndex((goal) => goal.id === id && goal.user_id === userId);
  if (index === -1) {
    throw new Error("Meta no encontrada.");
  }

  const updatedGoal: Goal = {
    ...goals[index],
    current_amount: goals[index].current_amount + data.amount,
    status: goals[index].current_amount + data.amount >= goals[index].target_amount ? "completada" : goals[index].status,
    updated_at: new Date().toISOString(),
  };
  goals[index] = updatedGoal;
  saveLocalGoals(goals);
  await recordGoalContribution(id, userId, data.amount);
  return updatedGoal;
}

async function recordGoalContribution(goalId: string, userId: string, amount: number): Promise<void> {
  const contribution: GoalContribution = {
    id: crypto.randomUUID(),
    goal_id: goalId,
    user_id: userId,
    amount,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseEnabled() && supabase) {
    const { error } = await supabase.from("goal_contributions").insert(contribution);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const contributions = getLocalGoalContributions();
  saveLocalGoalContributions([...contributions, contribution]);
}

export async function getGoalContributions(userId: string): Promise<GoalContribution[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase.from("goal_contributions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as GoalContribution[];
  }

  return getLocalGoalContributions().filter((contribution) => contribution.user_id === userId).sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
}

export async function getMonthlyBalance(userId: string, year: number, month: number): Promise<MonthlyBalance> {
  const transactions = await getTransactions(userId);
  const filtered = transactions.filter((transaction) => {
    const date = new Date(transaction.transaction_date);
    return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
  });

  const income = filtered.filter((tx) => tx.type === "ingreso").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = filtered.filter((tx) => tx.type === "gasto").reduce((sum, tx) => sum + tx.amount, 0);

  return {
    income,
    expenses,
    net: income - expenses,
  };
}

export async function getCategoryBreakdown(userId: string, year: number, month: number): Promise<CategoryBreakdown[]> {
  const transactions = await getTransactions(userId);
  const filtered = transactions.filter((transaction) => {
    const date = new Date(transaction.transaction_date);
    return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && transaction.type === "gasto";
  });

  const categories = await getCategories(userId);
  const grouped = filtered.reduce((acc, transaction) => {
    const key = transaction.category_id ?? "unknown";
    acc[key] = (acc[key] ?? 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);

  return Object.entries(grouped).map(([categoryId, totalAmount]) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return {
      category_id: categoryId === "unknown" ? null : categoryId,
      category_name: category?.name ?? "Sin categoría",
      total: totalAmount,
      percentage: total > 0 ? Number(((totalAmount / total) * 100).toFixed(1)) : 0,
      color: category?.color ?? "#64748b",
      emoji: category?.emoji ?? "❓",
    };
  });
}

export async function getDailyBalanceEvolution(userId: string, year: number, month: number): Promise<DailyBalance[]> {
  const transactions = await getTransactions(userId);
  const filtered = transactions.filter((transaction) => {
    const date = new Date(transaction.transaction_date);
    return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
  });

  const days = new Map<string, number>();
  filtered.forEach((transaction) => {
    const key = transaction.transaction_date;
    const value = transaction.type === "ingreso" ? transaction.amount : -transaction.amount;
    days.set(key, (days.get(key) ?? 0) + value);
  });

  const sortedDates = Array.from(days.keys()).sort();
  let cumulative = 0;
  return sortedDates.map((date) => {
    cumulative += days.get(date) ?? 0;
    return { date, balance: cumulative };
  });
}

export async function getEmotionAnalysis(userId: string): Promise<EmotionAnalysis[]> {
  const transactions = await getTransactions(userId);
  const filtered = transactions.filter((transaction) => transaction.type === "gasto" && transaction.emotion);

  const grouped = filtered.reduce((acc, transaction) => {
    const key = transaction.emotion as string;
    acc[key] = (acc[key] ?? 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);

  return Object.entries(grouped).map(([emotion, amount]) => ({
    emotion,
    total_amount: amount,
    percentage: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0,
  }));
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const mode = await getSystemMode();
  const categoryCount = (await getCategories(userId)).length;

  return {
    welcome: `Bienvenido a GoCash ${mode === "seed" ? "(Seed Mode)" : "(Live Mode)"}`,
    categoriesCount: categoryCount,
    seedMode: mode === "seed",
    userCount: mode === "seed" ? getSeedUsers().length + getLocalUsers().length : undefined,
  };
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (!user.is_active) return null;

  if (!(await validatePassword(user, password))) {
    return null;
  }

  return buildSafeUser(user);
}
