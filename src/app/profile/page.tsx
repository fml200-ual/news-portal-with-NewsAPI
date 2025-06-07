"use client";

import { Loader2, Settings, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewsCard } from "@/components/news/news-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { NewsArticle } from "@/types";
import { useTheme } from '@/hooks/use-theme';

const formSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .max(30, { message: "El nombre no puede tener más de 30 caracteres." }),
  bio: z
    .string()
    .max(160, { message: "La biografía no puede tener más de 160 caracteres." })
    .optional(),
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
  const [favorites, setFavorites] = useState<NewsArticle[]>([]);
  const [theme, setTheme] = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      theme: theme,
      emailNotifications: true,
    },
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        const data = await response.json();
        if (data.status === "ok") {
          form.reset(data.preferences);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar tus preferencias",
        });
      }
    };

    const loadFavorites = async () => {
      try {
        setIsFavoritesLoading(true);
        const response = await fetch('/api/news/favorites');
        const data = await response.json();
        if (data.status === "ok") {
          setFavorites(data.articles || []);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar tus artículos favoritos",
        });
        setFavorites([]);
      } finally {
        setIsFavoritesLoading(false);
      }
    };

    loadPreferences();
    loadFavorites();
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: values,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar preferencias');

      const data = await response.json();
      if (data.status === "ok") {
        toast({
          description: "Preferencias actualizadas correctamente",
        });
      }
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron actualizar tus preferencias",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-headline font-bold mb-8 flex items-center gap-3">
        <UserCircle className="h-10 w-10 text-primary" />
        Mi Perfil
      </h1>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            Favoritos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Usuario</CardTitle>
              <CardDescription>
                Personaliza tu experiencia en el portal de noticias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage />
                      <AvatarFallback>
                        {form.getValues("displayName")?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre para mostrar</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Input placeholder="Una breve descripción sobre ti" {...field} />
                        </FormControl>
                        <FormDescription>
                          Máximo 160 caracteres.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setTheme(value as "light" | "dark" | "system");
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tema" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Claro</SelectItem>
                              <SelectItem value="dark">Oscuro</SelectItem>
                              <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Personaliza la apariencia del portal.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel>
                              Notificaciones por email
                            </FormLabel>
                            <FormDescription>
                              Recibe actualizaciones sobre noticias relevantes.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="min-h-screen">
          {isFavoritesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-[300px]">
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[150px] w-full rounded-md" />
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((article) => (
                <NewsCard key={article.id} article={article} initialFavorite={true} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No hay favoritos</CardTitle>
                <CardDescription>
                  Aún no has guardado ningún artículo en favoritos.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
