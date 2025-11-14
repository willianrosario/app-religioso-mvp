"use client";

import { useState, useEffect } from "react";
import { Book, Heart, Share2, Star, Check, Sparkles, Clock, ChevronRight, Users, TrendingUp, Shield, Zap, Award, MessageCircle, X, Calendar, Search, LogOut, CreditCard, Send, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { supabase } from "@/lib/supabase";

type AuthView = "landing" | "login" | "register" | "app";

export default function Home() {
  const [view, setView] = useState<AuthView>("landing");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [communityPost, setCommunityPost] = useState("");
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    loadCommunityPosts();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setView("app");
    }
  };

  const loadCommunityPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setCommunityPosts(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("landing");
  };

  const handlePayment = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const toggleFavorite = (reference: string) => {
    setFavorites(prev => 
      prev.includes(reference) 
        ? prev.filter(f => f !== reference)
        : [...prev, reference]
    );
  };

  const handlePostCommunity = async () => {
    if (!communityPost.trim() || !user) return;

    const { data, error } = await supabase
      .from('community_posts')
      .insert([
        {
          user_id: user.id,
          user_name: user.user_metadata?.nome || 'Usuário',
          content: communityPost,
        }
      ])
      .select();

    if (data) {
      setCommunityPosts([data[0], ...communityPosts]);
      setCommunityPost("");
    }
  };

  const handleLikePost = async (postId: string) => {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;

    const { data, error } = await supabase
      .from('community_posts')
      .update({ likes: (post.likes || 0) + 1 })
      .eq('id', postId)
      .select();

    if (data) {
      setCommunityPosts(communityPosts.map(p => 
        p.id === postId ? data[0] : p
      ));
    }
  };

  const stats = [
    { icon: Users, value: "500K+", label: "Usuários Ativos" },
    { icon: Star, value: "4.9/5", label: "Avaliação" },
    { icon: TrendingUp, value: "98%", label: "Satisfação" },
    { icon: Award, value: "#1", label: "App Religioso" }
  ];

  const features = [
    {
      icon: Book,
      title: "Bíblia Completa",
      description: "Acesso offline a todas as traduções, com busca inteligente e marcadores personalizados",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Mensagens Diárias",
      description: "Reflexões inspiradoras em texto para fortalecer sua fé todos os dias",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "Orações Guiadas",
      description: "Orações para cada momento: manhã, noite, proteção, gratidão e muito mais",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Calendar,
      title: "Devocionais Diários",
      description: "Reflexões profundas e versículos selecionados para cada dia do ano",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageCircle,
      title: "Comunidade Ativa",
      description: "Conecte-se com outros fiéis, compartilhe experiências e fortaleça sua fé em comunidade",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Share2,
      title: "Compartilhamento",
      description: "Compartilhe versículos e mensagens com amigos e familiares nas redes sociais",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Usuária há 2 anos",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      text: "O Trompete transformou minha rotina espiritual. As mensagens diárias me ajudam a começar o dia com paz e propósito.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Usuário há 1 ano",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      text: "Incrível ter a Bíblia completa no celular. Leio durante o trajeto para o trabalho todos os dias.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Usuária há 6 meses",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      text: "As orações guiadas são perfeitas! Me ajudaram a criar uma rotina de oração consistente e significativa.",
      rating: 5
    }
  ];

  const plans = {
    monthly: {
      price: "19,90",
      period: "mês",
      savings: null
    },
    yearly: {
      price: "179,90",
      period: "ano",
      savings: "Economize R$ 58,90"
    }
  };

  const dailyMessages = [
    {
      title: "Mensagem de Hoje",
      date: "14 de Janeiro de 2025",
      content: "\"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.\" - João 3:16",
      reflection: "O amor de Deus por nós é incondicional e eterno. Hoje, reflita sobre como você pode demonstrar esse amor divino em suas ações e palavras. Seja uma luz para aqueles ao seu redor."
    },
    {
      title: "Reflexão Matinal",
      date: "14 de Janeiro de 2025",
      content: "\"Entrega o teu caminho ao Senhor; confia nele, e ele o fará.\" - Salmos 37:5",
      reflection: "Confie no plano de Deus para sua vida. Mesmo quando as coisas parecem incertas, Ele está no controle. Entregue suas preocupações a Ele e encontre paz."
    },
    {
      title: "Palavra de Fé",
      date: "14 de Janeiro de 2025",
      content: "\"Tudo posso naquele que me fortalece.\" - Filipenses 4:13",
      reflection: "Com Cristo, você tem força para enfrentar qualquer desafio. Não importa o que você esteja passando hoje, lembre-se de que Deus está com você, fortalecendo cada passo."
    }
  ];

  const prayers = [
    {
      category: "Manhã",
      title: "Oração da Manhã",
      content: "Senhor, agradeço por mais um dia de vida. Que eu possa honrar-Te em tudo que fizer hoje. Guia meus passos, ilumina meu caminho e enche meu coração de paz. Que eu seja instrumento do Teu amor e da Tua graça. Em nome de Jesus, amém."
    },
    {
      category: "Noite",
      title: "Oração da Noite",
      content: "Pai celestial, agradeço por todas as bênçãos deste dia. Perdoa minhas falhas e renova minhas forças para o amanhã. Protege minha família e todos aqueles que amo. Que eu possa descansar em Tua paz. Em nome de Jesus, amém."
    },
    {
      category: "Proteção",
      title: "Oração de Proteção",
      content: "Senhor, coloco minha vida e minha família sob Tua proteção. Guarda-nos de todo mal, perigo e enfermidade. Que Teus anjos nos cerquem e nos protejam. Confiamos em Teu poder e amor. Em nome de Jesus, amém."
    },
    {
      category: "Gratidão",
      title: "Oração de Gratidão",
      content: "Pai amado, meu coração transborda de gratidão. Obrigado por Tua fidelidade, Teu amor incondicional e Tuas incontáveis bênçãos. Que eu nunca esqueça de Te agradecer em todos os momentos. Em nome de Jesus, amém."
    },
    {
      category: "Força",
      title: "Oração por Força",
      content: "Senhor, preciso da Tua força neste momento. Renova minhas energias, fortalece minha fé e me dá coragem para enfrentar os desafios. Que eu encontre em Ti a força que preciso. Em nome de Jesus, amém."
    },
    {
      category: "Paz",
      title: "Oração pela Paz",
      content: "Deus de paz, acalma meu coração e minha mente. Afasta toda ansiedade e preocupação. Enche-me com Tua paz que excede todo entendimento. Que eu possa descansar em Ti. Em nome de Jesus, amém."
    }
  ];

  const verses = [
    {
      reference: "Salmos 23:1-4",
      text: "O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome. Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam."
    },
    {
      reference: "Provérbios 3:5-6",
      text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas."
    },
    {
      reference: "Isaías 41:10",
      text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça."
    },
    {
      reference: "Mateus 11:28",
      text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei."
    },
    {
      reference: "Romanos 8:28",
      text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito."
    },
    {
      reference: "Filipenses 4:6-7",
      text: "Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus."
    }
  ];

  const resources = [
    {
      category: "Versículos Diários",
      items: [
        { title: "Versículo do Dia", description: "Receba um versículo inspirador todos os dias" },
        { title: "Plano de Leitura", description: "Leia a Bíblia completa em 1 ano" },
        { title: "Temas Especiais", description: "Versículos organizados por temas" }
      ]
    },
    {
      category: "Eventos da Comunidade",
      items: [
        { title: "Cultos Online", description: "Participe de cultos ao vivo" },
        { title: "Grupos de Oração", description: "Encontre grupos próximos a você" },
        { title: "Retiros Espirituais", description: "Participe de retiros e encontros" }
      ]
    },
    {
      category: "Materiais de Estudo",
      items: [
        { title: "Estudos Bíblicos", description: "Aprofunde seu conhecimento da Palavra" },
        { title: "Comentários", description: "Entenda melhor cada livro da Bíblia" },
        { title: "Devocionais", description: "Reflexões diárias para sua jornada" }
      ]
    }
  ];

  // Landing Page
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0yNCAwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Mais de 500 mil pessoas já transformaram suas vidas
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Fortaleça sua Fé com o
                <span className="block mt-2 bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
                  Trompete
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl mb-8 text-blue-100 leading-relaxed max-w-3xl mx-auto">
                O aplicativo completo para sua jornada espiritual: Bíblia, mensagens diárias, orações guiadas e muito mais
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg"
                  onClick={() => setView("register")}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-lg px-8 py-6 shadow-2xl hover:shadow-amber-500/50 transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Experimentar Agora Grátis
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => setView("login")}
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 backdrop-blur-sm"
                >
                  <Book className="w-5 h-5 mr-2" />
                  Já tenho conta
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>3 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-300" />
                  <span>Acesso imediato</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full mb-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-white to-sky-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-sky-100 text-sky-700 border-sky-200 px-4 py-2">
                Recursos Completos
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ferramentas poderosas para fortalecer sua fé e transformar sua vida espiritual
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-all group cursor-pointer overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${feature.gradient}`}></div>
                    <CardHeader>
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gray-800 group-hover:text-sky-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200 px-4 py-2">
                <MessageCircle className="w-4 h-4 mr-2 inline" />
                Depoimentos Reais
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Vidas Transformadas
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Veja o que nossos usuários dizem sobre o Trompete
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-sky-100"
                      />
                      <div>
                        <CardTitle className="text-lg text-gray-800">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gradient-to-b from-sky-50 to-blue-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-white text-sky-700 border-sky-200 px-4 py-2">
                <Zap className="w-4 h-4 mr-2 inline" />
                Planos Acessíveis
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Escolha seu plano
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Comece com 3 dias grátis. Cancele quando quiser, sem compromisso.
              </p>

              <div className="inline-flex items-center gap-3 bg-white rounded-full p-1 shadow-lg">
                <button
                  onClick={() => setSelectedPlan("monthly")}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedPlan === "monthly"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setSelectedPlan("yearly")}
                  className={`px-6 py-3 rounded-full font-semibold transition-all relative ${
                    selectedPlan === "yearly"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Anual
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-none text-xs">
                    -25%
                  </Badge>
                </button>
              </div>
            </div>

            <div className="max-w-lg mx-auto">
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-600"></div>
                <CardHeader className="text-center pb-8 pt-8">
                  <Badge className="mx-auto mb-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-none px-4 py-2">
                    Mais Popular
                  </Badge>
                  <CardTitle className="text-3xl text-gray-800 mb-2">Plano Premium</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-800">R$ {plans[selectedPlan].price}</span>
                    <span className="text-xl text-gray-600">/{plans[selectedPlan].period}</span>
                  </div>
                  {plans[selectedPlan].savings && (
                    <Badge className="mt-3 bg-green-100 text-green-700 border-green-200">
                      {plans[selectedPlan].savings}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  {[
                    "3 dias de teste grátis",
                    "Bíblia completa offline",
                    "Mensagens diárias ilimitadas",
                    "Orações guiadas",
                    "Versículos favoritos",
                    "Comunidade ativa",
                    "Compartilhamento ilimitado",
                    "Sem anúncios",
                    "Suporte prioritário",
                    "Atualizações gratuitas"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}

                  <Button 
                    size="lg"
                    onClick={() => setView("register")}
                    className="w-full mt-8 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-lg py-6 shadow-xl hover:shadow-2xl transition-all"
                  >
                    Começar Teste Grátis
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Cancele quando quiser. Sem taxas ocultas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">100% Seguro</h3>
                  <p className="text-gray-600">Seus dados protegidos com criptografia de ponta</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Acesso Instantâneo</h3>
                  <p className="text-gray-600">Comece a usar imediatamente após o cadastro</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Garantia Total</h3>
                  <p className="text-gray-600">Satisfação garantida ou seu dinheiro de volta</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0yNCAwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Transforme sua vida espiritual hoje
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Junte-se a mais de 500 mil pessoas que já fortaleceram sua fé com o Trompete
              </p>
              <Button 
                size="lg"
                onClick={() => setView("register")}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xl px-12 py-7 shadow-2xl hover:shadow-amber-500/50 transition-all"
              >
                <Clock className="w-6 h-6 mr-2" />
                Começar Teste Grátis Agora
              </Button>
              <p className="mt-6 text-blue-100">
                Sem cartão de crédito necessário para o teste
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Trompete</span>
              </div>
              <p className="text-gray-400 mb-6">Fortalecendo sua fé, transformando vidas</p>
              <div className="flex justify-center gap-6 text-sm">
                <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
                <a href="#" className="hover:text-white transition-colors">Suporte</a>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                © 2025 Trompete. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Login View
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setView("landing")}
              className="text-white hover:bg-white/20 mb-4"
            >
              ← Voltar
            </Button>
          </div>
          <LoginForm 
            onSuccess={() => {
              checkUser();
            }}
            onSwitchToRegister={() => setView("register")}
          />
        </div>
      </div>
    );
  }

  // Register View
  if (view === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setView("landing")}
              className="text-white hover:bg-white/20 mb-4"
            >
              ← Voltar
            </Button>
          </div>
          <RegisterForm 
            onSuccess={() => {
              checkUser();
            }}
            onSwitchToLogin={() => setView("login")}
          />
        </div>
      </div>
    );
  }

  // App View (Authenticated)
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-blue-50">
      {/* App Header */}
      <header className="bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Book className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Trompete</h1>
                <p className="text-xs text-blue-100">Olá, {user?.user_metadata?.nome || 'Usuário'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePayment("monthly")}
                className="text-white hover:bg-white/20"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Assinar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* App Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 mb-8">
            <TabsTrigger value="messages" className="rounded-none border-b-2 data-[state=active]:border-sky-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="prayers" className="rounded-none border-b-2 data-[state=active]:border-sky-600">
              <Heart className="w-4 h-4 mr-2" />
              Orações
            </TabsTrigger>
            <TabsTrigger value="verses" className="rounded-none border-b-2 data-[state=active]:border-sky-600">
              <Book className="w-4 h-4 mr-2" />
              Versículos
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-none border-b-2 data-[state=active]:border-sky-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Comunidade
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-none border-b-2 data-[state=active]:border-sky-600">
              <Calendar className="w-4 h-4 mr-2" />
              Recursos
            </TabsTrigger>
          </TabsList>

          {/* Mensagens Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Mensagens Diárias</h2>
              <p className="text-gray-600">Reflexões inspiradoras para fortalecer sua fé</p>
            </div>

            {dailyMessages.map((message, index) => (
              <Card key={index} className="border-2 hover:border-sky-300 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-800">{message.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {message.date}
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                      Novo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded">
                    <p className="text-gray-800 font-medium italic">{message.content}</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{message.reflection}</p>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar Mensagem
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Orações Tab */}
          <TabsContent value="prayers" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Orações Guiadas</h2>
              <p className="text-gray-600">Orações para cada momento do seu dia</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {prayers.map((prayer, index) => (
                <Card 
                  key={index} 
                  className="border-2 hover:border-amber-300 transition-all cursor-pointer"
                  onClick={() => setSelectedPrayer(selectedPrayer === prayer.title ? null : prayer.title)}
                >
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-amber-100 text-amber-700 border-amber-200">
                      {prayer.category}
                    </Badge>
                    <CardTitle className="text-lg text-gray-800">{prayer.title}</CardTitle>
                  </CardHeader>
                  {selectedPrayer === prayer.title && (
                    <CardContent className="space-y-4">
                      <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                        <p className="text-gray-800 leading-relaxed">{prayer.content}</p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar Oração
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Versículos Tab */}
          <TabsContent value="verses" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Versículos Bíblicos</h2>
              <p className="text-gray-600">Palavras de sabedoria e conforto</p>
            </div>

            <div className="mb-6">
              <Input 
                placeholder="Buscar versículos..." 
                className="w-full"
              />
            </div>

            {verses.map((verse, index) => (
              <Card 
                key={index} 
                className="border-2 hover:border-blue-300 transition-all"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-sky-700">{verse.reference}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <p className="text-gray-800 leading-relaxed">{verse.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toggleFavorite(verse.reference)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${favorites.includes(verse.reference) ? 'fill-red-500 text-red-500' : ''}`} />
                      {favorites.includes(verse.reference) ? 'Favoritado' : 'Favoritar'}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Comunidade Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Comunidade</h2>
              <p className="text-gray-600">Compartilhe sua fé e conecte-se com outros fiéis</p>
            </div>

            <Card className="border-2 border-sky-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Compartilhe sua experiência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Compartilhe um testemunho, pedido de oração ou reflexão..."
                  value={communityPost}
                  onChange={(e) => setCommunityPost(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handlePostCommunity}
                  disabled={!communityPost.trim()}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {communityPosts.map((post, index) => (
                <Card key={index} className="border-2 hover:border-sky-200 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-gray-800">{post.user_name}</CardTitle>
                        <CardDescription>
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className="text-gray-600 hover:text-sky-600"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        {post.likes || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-sky-600">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Comentar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recursos Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Recursos</h2>
              <p className="text-gray-600">Materiais para aprofundar sua jornada espiritual</p>
            </div>

            {resources.map((resource, index) => (
              <div key={index}>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{resource.category}</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {resource.items.map((item, itemIndex) => (
                    <Card key={itemIndex} className="border-2 hover:border-green-300 transition-all cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-base text-gray-800">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-gray-800">Finalizar Assinatura</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPayment(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CardDescription>
                Plano {selectedPlan === "monthly" ? "Mensal" : "Anual"} - R$ {plans[selectedPlan].price}/{plans[selectedPlan].period}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Link de Pagamento:</strong>
                </p>
                <a 
                  href={`https://pay.example.com/trompete/${selectedPlan}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-700 underline break-all"
                >
                  https://pay.example.com/trompete/{selectedPlan}
                </a>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  ✓ Pagamento 100% seguro
                </p>
                <p className="text-sm text-gray-600">
                  ✓ Acesso imediato após confirmação
                </p>
                <p className="text-sm text-gray-600">
                  ✓ Cancele quando quiser
                </p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                onClick={() => window.open(`https://pay.example.com/trompete/${selectedPlan}`, '_blank')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Ir para Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
