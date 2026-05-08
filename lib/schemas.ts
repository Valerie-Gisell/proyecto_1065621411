import { z } from "zod";

export const CategoryType = z.enum(["ingreso", "gasto", "ambos"]);

export const CategorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  emoji: z.string().min(1, "El emoji es requerido."),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex válido."),
  type: CategoryType,
  is_active: z.boolean().optional(),
});

export const CreateCategorySchema = CategorySchema.pick({
  name: true,
  emoji: true,
  color: true,
  type: true,
}).extend({ user_id: z.string().uuid().nullable().optional() });

export const UpdateCategorySchema = CategorySchema.partial();

export const TransactionType = z.enum(["ingreso", "gasto"]);
export const EmotionType = z.enum(["feliz", "tranquilo", "triste", "estresado", "emocionado"]);

export const TransactionSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  type: TransactionType,
  amount: z.number().positive("El monto debe ser mayor que cero."),
  description: z.string().max(200).optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,
    "La fecha debe tener formato YYYY-MM-DD."),
  emotion: EmotionType.nullable().optional(),
});

export const CreateTransactionSchema = TransactionSchema;
export const UpdateTransactionSchema = TransactionSchema.partial();

export const TransactionFiltersSchema = z.object({
  type: TransactionType.optional(),
  category_id: z.string().uuid().optional(),
  emotion: EmotionType.optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const CreateAdminUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Debe ser un correo válido."),
  currency: z.string().min(1).optional(),
  role: z.enum(["usuario", "superadmin"]).optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").optional(),
  currency: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
  must_change_password: z.boolean().optional(),
});

export const GoalSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  emoji: z.string().min(1, "El emoji es requerido."),
  target_amount: z.number().positive("El monto objetivo debe ser mayor que cero."),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().max(200).optional(),
});

export const CreateGoalSchema = GoalSchema;
export const UpdateGoalSchema = GoalSchema.partial();
export const ContributeGoalSchema = z.object({
  amount: z.number().positive("El aporte debe ser mayor que cero."),
});
