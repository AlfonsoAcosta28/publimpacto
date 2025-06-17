const { Order, User, Product, Category, OrderItem, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const dashboardController = {
  // Obtener estadísticas generales
  getStats: async (req, res) => {
    try {
      const today = moment().startOf('day');
      const lastMonth = moment().subtract(1, 'month').startOf('day');
      const currentMonth = moment().startOf('month');

      // Ventas del mes actual
      const currentMonthOrders = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: currentMonth.toDate()
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        raw: true
      });
      const currentMonthTotal = parseFloat(currentMonthOrders[0].total) || 0;

      // Ventas del mes anterior
      const lastMonthOrders = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: lastMonth.toDate(),
            [Op.lt]: currentMonth.toDate()
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        raw: true
      });
      const lastMonthTotal = parseFloat(lastMonthOrders[0].total) || 0;

      // Pedidos del mes actual
      const currentMonthOrderCount = await Order.count({
        where: {
          created_at: {
            [Op.gte]: currentMonth.toDate()
          }
        }
      });

      const lastMonthOrderCount = await Order.count({
        where: {
          created_at: {
            [Op.gte]: lastMonth.toDate(),
            [Op.lt]: currentMonth.toDate()
          }
        }
      });

      // Usuarios nuevos del mes
      const newUsersThisMonth = await User.count({
        where: {
          created_at: {
            [Op.gte]: currentMonth.toDate()
          }
        }
      });
      const newUsersLastMonth = await User.count({
        where: {
          created_at: {
            [Op.gte]: lastMonth.toDate(),
            [Op.lt]: currentMonth.toDate()
          }
        }
      });

      // Actividad de hoy
      const todayOrders = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: today.toDate()
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        raw: true
      });
      const todayTotal = parseFloat(todayOrders[0].total) || 0;

      const todayNewOrders = await Order.count({
        where: {
          created_at: {
            [Op.gte]: today.toDate()
          },
          status: 'pendiente'
        }
      });

      const todayShippedOrders = await Order.count({
        where: {
          created_at: {
            [Op.gte]: today.toDate()
          },
          status: 'enviado'
        }
      });

      const todayNewUsers = await User.count({
        where: {
          created_at: {
            [Op.gte]: today.toDate()
          }
        }
      });

      res.json({
        sales: {
          current: currentMonthTotal,
          previous: lastMonthTotal,
          percentage: lastMonthTotal ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0
        },
        orders: {
          current: currentMonthOrderCount,
          previous: lastMonthOrderCount,
          percentage: lastMonthOrderCount ? ((currentMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount * 100) : 0
        },
        users: {
          current: newUsersThisMonth,
          previous: newUsersLastMonth,
          percentage: newUsersLastMonth ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100) : 0
        },
        today: {
          newOrders: todayNewOrders,
          shippedOrders: todayShippedOrders,
          newUsers: todayNewUsers,
          total: todayTotal
        }
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' });
    }
  },

  // Obtener datos de ventas por período
  getSalesData: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const startDate = moment().subtract(period === 'year' ? 12 : 6, 'months').startOf('month');
      
      const sales = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: startDate.toDate()
          }
        },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
          [sequelize.fn('sum', sequelize.col('total')), 'total']
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']]
      });

      const formattedSales = sales.map(sale => ({
        name: moment(sale.getDataValue('month')).format('MMM'),
        value: parseFloat(sale.getDataValue('total'))
      }));

      res.json(formattedSales);
    } catch (error) {
      console.error('Error getting sales data:', error);
      res.status(500).json({ message: 'Error al obtener datos de ventas' });
    }
  },

  // Obtener datos de visitas (simulado)
  getVisitsData: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const startDate = moment().subtract(period === 'year' ? 12 : 6, 'months').startOf('month');
      
      // Simulamos datos de visitas (en un caso real, esto vendría de analytics)
      const visits = [];
      let currentDate = moment(startDate);
      
      while (currentDate.isBefore(moment())) {
        visits.push({
          name: currentDate.format('MMM'),
          value: Math.floor(Math.random() * 5000) + 3000
        });
        currentDate.add(1, 'month');
      }

      res.json(visits);
    } catch (error) {
      console.error('Error getting visits data:', error);
      res.status(500).json({ message: 'Error al obtener datos de visitas' });
    }
  },

  // Obtener ventas por categoría
  getCategoryData: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const startDate = moment().subtract(period === 'year' ? 12 : 6, 'months').startOf('month');

      const categorySales = await OrderItem.findAll({
        include: [
          {
            model: Order,
            as: 'Order',
            where: {
              created_at: {
                [Op.gte]: startDate.toDate()
              }
            },
            attributes: []
          },
          {
            model: Product,
            as: 'Product',
            include: [{
              model: Category,
              as: 'category',
              attributes: ['id', 'title']
            }],
            attributes: []
          }
        ],
        attributes: [
          [sequelize.fn('sum', sequelize.literal('OrderItem.cantidad * OrderItem.precio_unitario')), 'total'],
          [sequelize.col('Product.category.title'), 'category_title']
        ],
        group: ['Product.category.id', 'Product.category.title']
      });

      const formattedData = categorySales.map(sale => ({
        name: sale.getDataValue('category_title'),
        value: parseFloat(sale.getDataValue('total'))
      }));

      res.json(formattedData);
    } catch (error) {
      console.error('Error getting category data:', error);
      res.status(500).json({ message: 'Error al obtener datos por categoría' });
    }
  },

  // Obtener pedidos recientes
  getRecentOrders: async (req, res) => {
    try {
      const { limit = 4 } = req.query;
      
      const orders = await Order.findAll({
        limit: parseInt(limit),
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['correo']
          },
          {
            model: OrderItem,
            as: 'OrderItems',
            include: [{
              model: Product,
              as: 'Product',
              attributes: ['id', 'title', 'price']
            }]
          }
        ],
        order: [['created_at', 'DESC']],
        attributes: ['id', 'total', 'status', 'created_at']
      });

      // Transformar los datos para asegurar que la estructura sea consistente
      const formattedOrders = orders.map(order => ({
        ...order.toJSON(),
        user: order.User ? {
          correo: order.User.correo
        } : null
      }));

      res.json(formattedOrders);
    } catch (error) {
      console.error('Error getting recent orders:', error);
      res.status(500).json({ message: 'Error al obtener pedidos recientes' });
    }
  },

  // Obtener productos recientes
  getRecentProducts: async (req, res) => {
    try {
      const { limit = 3 } = req.query;
      
      const products = await Product.findAll({
        limit: parseInt(limit),
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'title']
        }],
        order: [['created_at', 'DESC']]
      });

      res.json(products);
    } catch (error) {
      console.error('Error getting recent products:', error);
      res.status(500).json({ message: 'Error al obtener productos recientes' });
    }
  },

  // Obtener usuarios recientes
  getRecentUsers: async (req, res) => {
    try {
      const { limit = 3 } = req.query;
      
      const users = await User.findAll({
        limit: parseInt(limit),
        attributes: ['id', 'correo', 'created_at'],
        order: [['created_at', 'DESC']]
      });

    //   console.log(users);

      res.json(users);
    } catch (error) {
      console.error('Error getting recent users:', error);
      res.status(500).json({ message: 'Error al obtener usuarios recientes' });
    }
  }
};

module.exports = dashboardController;