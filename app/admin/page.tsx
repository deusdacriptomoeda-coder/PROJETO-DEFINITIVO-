"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createBrowserClient } from "@supabase/ssr"
import { Package, Users, DollarSign, TrendingUp, Eye, Search } from "lucide-react"

interface Order {
  id: string
  customer_id: string
  product_id: string
  quantity: number
  total_amount: number
  payment_status: string
  payment_id: string
  created_at: string
  customers: {
    name: string
    email: string
    phone: string
  }
  products: {
    name: string
    price: number
    category: string
  }
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingOrders: number
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabase = supabaseUrl && supabaseKey ? createBrowserClient(supabaseUrl, supabaseKey) : null

  useEffect(() => {
    if (supabase) {
      setSupabaseAvailable(true)
      fetchOrders()
      fetchStats()
    } else {
      setLoading(false)
      setSupabaseAvailable(false)
    }
  }, [])

  const fetchOrders = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers (name, email, phone),
          products (name, price, category)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!supabase) return

    try {
      const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

      const { data: revenueData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "completed")

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

      const { count: totalCustomers } = await supabase.from("customers").select("*", { count: "exact", head: true })

      const { count: pendingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("payment_status", "pending")

      setStats({
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalCustomers: totalCustomers || 0,
        pendingOrders: pendingOrders || 0,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("orders").update({ payment_status: newStatus }).eq("id", orderId)

      if (error) throw error

      fetchOrders()
      fetchStats()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.payment_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      processing: "outline",
    }

    const labels: Record<string, string> = {
      completed: "Concluído",
      pending: "Pendente",
      failed: "Falhou",
      processing: "Processando",
    }

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
  }

  if (!supabaseAvailable) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">Kikomiilano</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Configuração Necessária</h2>
            <p className="text-yellow-700 text-sm">
              Para acessar o painel administrativo, configure as variáveis de ambiente do Supabase no seu provedor de
              hospedagem:
            </p>
            <ul className="text-yellow-700 text-sm mt-2 text-left">
              <li>• NEXT_PUBLIC_SUPABASE_URL</li>
              <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Voltar à Página Inicial
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Kikomiilano - Gestão de Pedidos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2).replace(".", ",")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome, email ou ID do pedido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID do Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.payment_id || order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customers?.name}</div>
                          <div className="text-sm text-muted-foreground">{order.customers?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.products?.name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>R$ {Number(order.total_amount).toFixed(2).replace(".", ",")}</TableCell>
                      <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Pedido</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Cliente</Label>
                                    <p className="font-medium">{selectedOrder.customers?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customers?.email}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customers?.phone}</p>
                                  </div>
                                  <div>
                                    <Label>Produto</Label>
                                    <p className="font-medium">{selectedOrder.products?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Quantidade: {selectedOrder.quantity}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <div>
                                    <Label>Status Atual</Label>
                                    <div className="mt-1">{getStatusBadge(selectedOrder.payment_status)}</div>
                                  </div>
                                  <div className="flex-1">
                                    <Label>Atualizar Status</Label>
                                    <Select onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecionar novo status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="processing">Processando</SelectItem>
                                        <SelectItem value="completed">Concluído</SelectItem>
                                        <SelectItem value="failed">Falhou</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
