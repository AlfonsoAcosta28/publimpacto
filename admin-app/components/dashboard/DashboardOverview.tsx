"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Search,
  Plus,
  Edit,
  Trash,
  ChevronDown,
  ShoppingBag,
  Package,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { dashboardService } from "@/services/dashboardService"
import { inventoryService } from "@/services/inventoryService"
import { toast } from "sonner"

import {
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from "next/link"

interface Stats {
  sales: {
    current: number;
    previous: number;
    percentage: number;
  };
  orders: {
    current: number;
    previous: number;
    percentage: number;
  };
  users: {
    current: number;
    previous: number;
    percentage: number;
  };
  today: {
    newOrders: number;
    shippedOrders: number;
    newUsers: number;
    total: number;
  };
}

interface Order {
  id: number;
  user: {
    correo: string;
  };
  created_at: string;
  total: number;
  status: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  badge: string;
  category: {
    id: number;
    title: string;
  };
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  correo: string;
  avatar?: string;
  created_at: string;
}

interface LowStockItem {
  id: number;
  available_quantity: number;
  min_stock_level: number;
  product: {
    id: number;
    title: string;
    price: string;
  };
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [salesData, setSalesData] = useState<Array<{ name: string; value: number }>>([]);
  const [visitsData, setVisitsData] = useState<Array<{ name: string; value: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsResponse,
        salesResponse,
        visitsResponse,
        categoriesResponse,
        ordersResponse,
        productsResponse,
        usersResponse,
        lowStockResponse
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getSalesData(period),
        dashboardService.getVisitsData(period),
        dashboardService.getCategoryData(period),
        dashboardService.getRecentOrders(),
        dashboardService.getRecentProducts(),
        dashboardService.getRecentUsers(),
        inventoryService.getLowStockItems()
      ]);

      console.log(productsResponse);
      setStats(statsResponse);
      setSalesData(salesResponse);
      setVisitsData(visitsResponse);
      setCategoryData(categoriesResponse);
      setRecentOrders(ordersResponse);
      setRecentProducts(productsResponse);
      setRecentUsers(usersResponse);
      setLowStockItems(lowStockResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <p className="text-sm text-gray-600">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-medium text-red-700">
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-700">{item.product.title}</h4>
                    <p className="text-sm text-red-600">
                      Stock actual: {item.available_quantity} | Mínimo requerido: {item.min_stock_level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-700">${item.product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-full mr-4">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Ventas <span className="text-xs">(Este mes)</span>
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2">${stats?.sales?.current ?? '0.00'}</h3>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  (stats?.sales?.percentage ?? 0) > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {(stats?.sales?.percentage ?? 0) > 0 ? '+' : ''}{stats?.sales?.percentage ?? 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500">Mes anterior: ${stats?.sales?.previous ?? '0.00'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-full mr-4">
              <Package className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Pedidos <span className="text-xs">(Este mes)</span>
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2">{stats?.orders?.current ?? 0}</h3>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  (stats?.orders?.percentage ?? 0) > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {(stats?.orders?.percentage ?? 0) > 0 ? '+' : ''}{stats?.orders?.percentage ?? 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500">Mes anterior: {stats?.orders?.previous ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-cyan-50 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Usuarios <span className="text-xs">(Este mes)</span>
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2">{stats?.users?.current ?? 0}</h3>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  (stats?.users?.percentage ?? 0) > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {(stats?.users?.percentage ?? 0) > 0 ? '+' : ''}{stats?.users?.percentage ?? 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500">Mes anterior: {stats?.users?.previous ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-2">Actividad de Hoy</p>
            <div className="flex justify-between mb-2">
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-1">
                  <span>{stats?.today?.newOrders ?? 0}</span>
                </div>
                <p className="text-xs">
                  Pedidos
                  <br />
                  Nuevos
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-1">
                  <span>{stats?.today?.shippedOrders ?? 0}</span>
                </div>
                <p className="text-xs">
                  Pedidos
                  <br />
                  Enviados
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-1">
                  <span>{stats?.today?.newUsers ?? 0}</span>
                </div>
                <p className="text-xs">Usuarios</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Ingresos de Hoy</p>
              <p className="text-lg font-bold">${stats?.today?.total ?? '0.00'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Ventas</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  {period === 'month' ? 'este mes' : 'este año'} <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPeriod('year')}>Este Año</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('month')}>Últimos 6 Meses</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const value = payload[0].value as number;
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="text-xs">${value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Visitas</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  {period === 'month' ? 'este mes' : 'este año'} <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPeriod('year')}>Este Año</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('month')}>Últimos 6 Meses</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={visitsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const value = payload[0].value as number;
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="text-xs">{value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "white", stroke: "#3B82F6", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Ventas por Categoría</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  {period === 'month' ? 'este mes' : 'este año'} <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPeriod('year')}>Este Año</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('month')}>Últimos 6 Meses</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">
            Pedidos Recientes <span className="text-xs font-normal text-gray-500">(Últimos 4 pedidos)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedido por ID o cliente"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
              />
            </div>
            {/* <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Button> */}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="whitespace-nowrap">ID</TableHead> */}
                  <TableHead className="whitespace-nowrap">CLIENTE</TableHead>
                  <TableHead className="whitespace-nowrap">FECHA</TableHead>
                  <TableHead className="whitespace-nowrap">TOTAL</TableHead>
                  <TableHead className="whitespace-nowrap">ESTADO</TableHead>
                  {/* <TableHead className="whitespace-nowrap">ACCIONES</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    {/* <TableCell className="font-medium">#{order.id}</TableCell> */}
                    <TableCell>{order.user.correo}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "entregado"
                            ? "entregado"
                            : order.status === "enviado"
                              ? "enviado"
                              : order.status === "procesando"
                                ? "procesando"
                                : "pendiente"
                        }
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-4">
            <Link href="/orders" className="text-blue-500 hover:text-blue-600 cursor-pointer">
              Ver todos los pedidos
       
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Productos Recientes */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6 mb-6">
        
      <Card>
        <CardHeader>
          <CardTitle>Productos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.title}</p>
                    {product.badge && (
                      <Badge variant="outline">{product.badge}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.category?.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Link href="/products" className="text-blue-500 hover:text-blue-600 cursor-pointer">
              Ver todos los productos
            </Link>
          </div>
        </CardContent>
      </Card>
      
      </div>

      {/* Recent Users */}
      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">
            Usuarios Recientes <span className="text-xs font-normal text-gray-500">(Últimos 4 usuarios)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user.correo.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium">{user.correo}</h4>
                  <p className="text-xs text-gray-500">
                    Registrado: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
          <Link href="/users" className="text-blue-500 hover:text-blue-600 cursor-pointer">
              Ver todos los usuarios
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  )
}