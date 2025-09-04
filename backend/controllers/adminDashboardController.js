const db = require('../models');
const { User, Subscription, Invoice, Feature, Plan, sequelize } = db;
const { Op, fn, col, literal } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {

    const [userCount, activeSubCount, totalRevenue, featureCount, planCount, overdueInvoices, planPopularity, revenueTrend, userTrend] = await Promise.all([
      User.count(),
      Subscription.count({ where: { status: 'active' } }),
      Invoice.sum('amount', { where: { status: 'paid' } }),
      Feature.count(),
      Plan.count(),
      Invoice.findAll({
        where: {
          status: { [Op.in]: ['unpaid', 'overdue'] },
          dueDate: { [Op.lt]: new Date() }
        },
        order: [['dueDate', 'ASC']],
        limit: 10,
        attributes: ['id', 'userId', 'amount', 'dueDate', 'status'],
        include: [{ model: User, as: 'user', attributes: ['username'] }]
      }),
      Subscription.findAll({
        where: { status: 'active' },
        attributes: ['planId', [fn('COUNT', col('planId')), 'count']],
        group: ['planId'],
        order: [[literal('count'), 'DESC']],
        limit: 1
      }),
      Invoice.findAll({
        where: {
          status: 'paid',
          invoiceDate: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
        },
        attributes: [
          [fn('DATE_TRUNC', 'month', col('invoiceDate')), 'month'],
          [fn('SUM', col('amount')), 'revenue']
        ],
        group: [fn('DATE_TRUNC', 'month', col('invoiceDate'))],
        order: [[fn('DATE_TRUNC', 'month', col('invoiceDate')), 'ASC']]
      }),

      User.findAll({
        where: { createdAt: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 5)) } },
        attributes: [
          [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
          [fn('COUNT', col('id')), 'users']
        ],
        group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
        order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']]
      })
    ]);

    const overdueInvoicesWithUser = overdueInvoices.map(inv => ({
      id: inv.id,
      userId: inv.userId,
      userName: inv.user ? inv.user.username : '',
      amount: inv.amount,
      dueDate: inv.dueDate,
      status: inv.status
    }));

    res.json({
      userCount,
      activeSubCount,
      totalRevenue: totalRevenue || 0,
      featureCount,
      planCount,
      overdueInvoices: overdueInvoicesWithUser,
      mostPopularPlan: planPopularity[0] ? planPopularity[0].planId : null,
      revenueTrend,
      userTrend
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
};
