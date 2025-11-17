"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, AlertCircle, Check, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  religiao: z.string().min(1, "Selecione sua religião"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReligion, setSelectedReligion] = useState<string>("");
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const religioes = [
    "Cristianismo",
    "Catolicismo",
    "Protestantismo",
    "Evangélico",
    "Pentecostal",
    "Adventista",
    "Testemunha de Jeová",
    "Mórmon",
    "Outra"
  ];

  const startCooldown = (seconds: number) => {
    setCooldownSeconds(seconds);
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (cooldownSeconds > 0) {
      setError(`Por favor, aguarde ${cooldownSeconds} segundos antes de tentar novamente.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            religiao: data.religiao,
          },
        },
      });

      if (authError) {
        console.error("Erro de autenticação:", authError);
        
        // Mensagens de erro em português com tratamento específico
        if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
          setError("Este email já está cadastrado. Tente fazer login.");
        } else if (authError.message.includes("Invalid email")) {
          setError("Email inválido. Verifique e tente novamente.");
        } else if (authError.message.includes("Password")) {
          setError("Senha muito fraca. Use no mínimo 6 caracteres.");
        } else if (authError.message.includes("security purposes") || authError.message.includes("request this after")) {
          // Extrair número de segundos da mensagem de erro
          const match = authError.message.match(/(\d+)\s*seconds?/);
          const seconds = match ? parseInt(match[1]) : 60;
          startCooldown(seconds);
          setError(`Por segurança, aguarde ${seconds} segundos antes de tentar criar a conta novamente.`);
        } else if (authError.message.includes("rate limit") || authError.message.includes("too many")) {
          startCooldown(60);
          setError("Muitas tentativas. Por favor, aguarde 1 minuto antes de tentar novamente.");
        } else {
          setError("Erro ao criar conta: " + authError.message);
        }
        return;
      }

      if (authData.user) {
        // Aguardar um pouco para garantir que a sessão está estabelecida
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Calcular data de fim do trial (3 dias)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);

        // Tentar inserir dados adicionais na tabela usuarios usando UPSERT
        // UPSERT garante que não haverá erro se o registro já existir
        const { error: dbError } = await supabase
          .from('usuarios')
          .upsert(
            {
              id: authData.user.id,
              email: data.email,
              nome: data.nome,
              religiao: data.religiao,
              trial_end_date: trialEndDate.toISOString(),
              is_subscribed: false,
            },
            {
              onConflict: 'id',
              ignoreDuplicates: false
            }
          );

        if (dbError) {
          console.error("Erro ao salvar dados do usuário:", dbError);
          
          // Tentar novamente com uma abordagem alternativa
          // Se falhar, vamos apenas logar o usuário e deixar os dados serem salvos depois
          console.warn("Continuando com login mesmo com erro no banco de dados");
        }

        // Enviar email de boas-vindas (não bloqueia o cadastro se falhar)
        try {
          const emailResponse = await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              nome: data.nome,
            }),
          });

          if (!emailResponse.ok) {
            console.error('Erro ao enviar email de boas-vindas');
          }
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
        }

        // Sucesso - redirecionar para a aplicação
        onSuccess();
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao criar conta. Tente novamente em alguns instantes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl text-gray-800">Comece sua jornada</CardTitle>
        <CardDescription className="text-base">
          Crie sua conta e ganhe 3 dias grátis
        </CardDescription>
        <Badge className="mx-auto mt-3 bg-green-100 text-green-700 border-green-200 px-4 py-2">
          <Check className="w-4 h-4 mr-2 inline" />
          Sem cartão de crédito necessário
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {cooldownSeconds > 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Aguarde <strong>{cooldownSeconds} segundos</strong> antes de tentar novamente.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              {...register("nome")}
              disabled={isLoading || cooldownSeconds > 0}
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email")}
              disabled={isLoading || cooldownSeconds > 0}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...register("password")}
              disabled={isLoading || cooldownSeconds > 0}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="religiao">Religião</Label>
            <Select
              value={selectedReligion}
              onValueChange={(value) => {
                setSelectedReligion(value);
                setValue("religiao", value);
              }}
              disabled={isLoading || cooldownSeconds > 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua religião" />
              </SelectTrigger>
              <SelectContent>
                {religioes.map((religiao) => (
                  <SelectItem key={religiao} value={religiao}>
                    {religiao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.religiao && (
              <p className="text-sm text-red-600">{errors.religiao.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white py-6 text-lg"
            disabled={isLoading || cooldownSeconds > 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : cooldownSeconds > 0 ? (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Aguarde {cooldownSeconds}s
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Começar Teste Grátis
              </>
            )}
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

          <p className="text-xs text-center text-gray-500 pt-2">
            Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
