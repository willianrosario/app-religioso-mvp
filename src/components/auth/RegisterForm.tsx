"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Lock, User, Church, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmarSenha: z.string(),
  religiao: z.string().min(1, "Selecione sua religião"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [religiao, setReligiao] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            religiao: data.religiao,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Calcular data de fim do período de teste (3 dias)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);

        // Inserir dados adicionais na tabela de usuários
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: authData.user.id,
              email: data.email,
              nome: data.nome,
              religiao: data.religiao,
              trial_end_date: trialEndDate.toISOString(),
              is_subscribed: false,
            },
          ]);

        if (insertError) {
          console.error("Erro ao inserir dados do usuário:", insertError);
        }

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl bg-white">
      <CardHeader className="space-y-1">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-center text-gray-800">
          Crie sua conta
        </CardTitle>
        <CardDescription className="text-center">
          Comece sua jornada espiritual com 3 dias grátis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                className="pl-10 h-12 border-2 border-gray-200 focus:border-amber-400"
                {...register("nome")}
              />
            </div>
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 h-12 border-2 border-gray-200 focus:border-amber-400"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="religiao">Religião</Label>
            <div className="relative">
              <Church className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Select
                value={religiao}
                onValueChange={(value) => {
                  setReligiao(value);
                  setValue("religiao", value);
                }}
              >
                <SelectTrigger className="pl-10 h-12 border-2 border-gray-200 focus:border-amber-400">
                  <SelectValue placeholder="Selecione sua religião" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="catolica">Católica</SelectItem>
                  <SelectItem value="evangelica">Evangélica</SelectItem>
                  <SelectItem value="protestante">Protestante</SelectItem>
                  <SelectItem value="espirita">Espírita</SelectItem>
                  <SelectItem value="outra">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.religiao && (
              <p className="text-sm text-red-500">{errors.religiao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                className="pl-10 h-12 border-2 border-gray-200 focus:border-amber-400"
                {...register("senha")}
              />
            </div>
            {errors.senha && (
              <p className="text-sm text-red-500">{errors.senha.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                className="pl-10 h-12 border-2 border-gray-200 focus:border-amber-400"
                {...register("confirmarSenha")}
              />
            </div>
            {errors.confirmarSenha && (
              <p className="text-sm text-red-500">{errors.confirmarSenha.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-base font-semibold shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar Conta Grátis"}
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                Faça login
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
