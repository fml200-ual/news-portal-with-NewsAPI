import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
  },
  preferences: {
    excludedSources: [String], // Fuentes de noticias que el usuario quiere excluir
    displayName: String, // Nombre para mostrar (puede ser diferente del nombre de registro)
    bio: String, // Biografía o descripción corta
    emailNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  favorites: [{
    id: String,
    title: String,
    description: String,
    content: String,
    imageUrl: String,
    category: String,
    sourceName: String,
    publishedAt: Date,
    url: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para verificar contraseña
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

export type UserDocument = mongoose.Document & {
  email: string;
  password: string;
  name: string;
  favorites: string[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
};
