import { NextAuthOptions, Session, User as NextAuthUser, DefaultUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '@/lib/models/User';

// Extiende los tipos de sesión y usuario para incluir 'id'
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User extends DefaultUser {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        // Connect to database with lazy loading
        const { connectToDatabase } = await import('@/lib/mongodb');
        await connectToDatabase();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        const isValid = await user.comparePassword(credentials.password);
        
        if (!isValid) {
          throw new Error('Contraseña incorrecta');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};
