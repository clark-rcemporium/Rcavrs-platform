/**
 * AVRS Analytics & Metrics Tracking
 * Real-time portfolio analytics and performance tracking
 */

const db = require('../db/connection');

class AnalyticsService {
  /**
   * Record venture metrics
   */
  async recordMetrics(ventureId, metrics) {
    try {
      const result = await db.query(
        `INSERT INTO venture_metrics 
        (venture_id, customers, mrr, arr, growth_rate_mom, cac, ltv, retention_rate, nrr, csat_score, nps_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          ventureId,
          metrics.customers || 0,
          metrics.mrr || 0,
          metrics.arr || 0,
          metrics.growthRateMom || 0,
          metrics.cac || 0,
          metrics.ltv || 0,
          metrics.retentionRate || 0,
          metrics.nrr || 0,
          metrics.csatScore || 0,
          metrics.npsScore || 0
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error recording metrics:', error);
      throw error;
    }
  }

  /**
   * Get venture metrics history
   */
  async getMetricsHistory(ventureId, days = 30) {
    try {
      const result = await db.query(
        `SELECT * FROM venture_metrics 
        WHERE venture_id = $1 
        AND recorded_at >= NOW() - INTERVAL '${days} days'
        ORDER BY recorded_at ASC`,
        [ventureId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting metrics history:', error);
      throw error;
    }
  }

  /**
   * Calculate portfolio metrics
   */
  async calculatePortfolioMetrics() {
    try {
      const result = await db.query(
        `SELECT 
          COUNT(DISTINCT v.id) as total_ventures,
          SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_ventures,
          SUM(vm.customers) as total_customers,
          SUM(vm.mrr) as total_mrr,
          SUM(vm.arr) as total_arr,
          AVG(vm.growth_rate_mom) as avg_growth_rate,
          AVG(vm.retention_rate) as avg_retention_rate,
          AVG(vm.nps_score) as avg_nps,
          SUM(tm.salary) as total_payroll,
          COUNT(DISTINCT tm.id) as total_team_members
        FROM ventures v
        LEFT JOIN venture_metrics vm ON v.id = vm.venture_id
        LEFT JOIN team_members tm ON v.id = tm.venture_id`
      );

      const metrics = result.rows[0];

      // Save portfolio snapshot
      await db.query(
        `INSERT INTO portfolio_metrics 
        (snapshot_date, total_ventures, active_ventures, total_customers, total_mrr, total_arr)
        VALUES (CURRENT_DATE, $1, $2, $3, $4, $5)`,
        [
          metrics.total_ventures,
          metrics.active_ventures,
          metrics.total_customers || 0,
          metrics.total_mrr || 0,
          metrics.total_arr || 0
        ]
      );

      return metrics;
    } catch (error) {
      console.error('Error calculating portfolio metrics:', error);
      throw error;
    }
  }

  /**
   * Get portfolio snapshot
   */
  async getPortfolioSnapshot(date = null) {
    try {
      const query = date 
        ? 'SELECT * FROM portfolio_metrics WHERE snapshot_date = $1'
        : 'SELECT * FROM portfolio_metrics ORDER BY snapshot_date DESC LIMIT 1';
      
      const params = date ? [date] : [];
      const result = await db.query(query, params);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting portfolio snapshot:', error);
      throw error;
    }
  }

  /**
   * Get venture comparison
   */
  async getVentureComparison(venture1Id, venture2Id, metric) {
    try {
      const result = await db.query(
        `SELECT vm1.${metric} as venture_1_value, vm2.${metric} as venture_2_value
        FROM venture_metrics vm1, venture_metrics vm2
        WHERE vm1.venture_id = $1 AND vm2.venture_id = $2
        ORDER BY vm1.recorded_at DESC, vm2.recorded_at DESC
        LIMIT 1`,
        [venture1Id, venture2Id]
      );

      if (!result.rows.length) {
        return null;
      }

      const row = result.rows[0];
      const variance = row.venture_1_value && row.venture_2_value 
        ? ((row.venture_1_value - row.venture_2_value) / row.venture_2_value) * 100
        : 0;

      return {
        venture1Id,
        venture2Id,
        metric,
        venture1Value: row.venture_1_value,
        venture2Value: row.venture_2_value,
        variance: variance.toFixed(2)
      };
    } catch (error) {
      console.error('Error getting venture comparison:', error);
      throw error;
    }
  }

  /**
   * Get growth analysis
   */
  async getGrowthAnalysis(ventureId, days = 90) {
    try {
      const result = await db.query(
        `SELECT 
          recorded_at,
          customers,
          mrr,
          growth_rate_mom,
          retention_rate
        FROM venture_metrics 
        WHERE venture_id = $1 
        AND recorded_at >= NOW() - INTERVAL '${days} days'
        ORDER BY recorded_at ASC`,
        [ventureId]
      );

      const metrics = result.rows;
      if (metrics.length < 2) {
        return { insufficient_data: true };
      }

      const first = metrics[0];
      const last = metrics[metrics.length - 1];

      return {
        period: `${days} days`,
        customerGrowth: {
          start: first.customers,
          end: last.customers,
          change: last.customers - first.customers,
          percentChange: ((last.customers - first.customers) / first.customers * 100).toFixed(2)
        },
        revenueGrowth: {
          start: first.mrr,
          end: last.mrr,
          change: last.mrr - first.mrr,
          percentChange: ((last.mrr - first.mrr) / first.mrr * 100).toFixed(2)
        },
        avgGrowthRate: (metrics.reduce((sum, m) => sum + m.growth_rate_mom, 0) / metrics.length).toFixed(2),
        avgRetention: (metrics.reduce((sum, m) => sum + m.retention_rate, 0) / metrics.length).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting growth analysis:', error);
      throw error;
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis() {
    try {
      const result = await db.query(
        `SELECT 
          v.phase,
          COUNT(DISTINCT v.id) as venture_count,
          AVG(vm.customers) as avg_customers,
          AVG(vm.mrr) as avg_mrr,
          AVG(vm.growth_rate_mom) as avg_growth,
          AVG(vm.retention_rate) as avg_retention
        FROM ventures v
        LEFT JOIN venture_metrics vm ON v.id = vm.venture_id
        GROUP BY v.phase
        ORDER BY v.phase ASC`
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting cohort analysis:', error);
      throw error;
    }
  }

  /**
   * Get unit economics
   */
  async getUnitEconomics(ventureId) {
    try {
      const metrics = await db.query(
        `SELECT * FROM venture_metrics 
        WHERE venture_id = $1 
        ORDER BY recorded_at DESC LIMIT 1`,
        [ventureId]
      );

      if (!metrics.rows.length) {
        return null;
      }

      const m = metrics.rows[0];

      return {
        ventureId,
        cac: m.cac,
        ltv: m.ltv,
        ltv_cac_ratio: m.cac > 0 ? (m.ltv / m.cac).toFixed(2) : 0,
        payback_period_months: m.cac > 0 ? (m.cac / (m.mrr / m.customers)).toFixed(2) : 0,
        nrr: m.nrr,
        retention_rate: m.retention_rate,
        csat_score: m.csat_score,
        nps_score: m.nps_score
      };
    } catch (error) {
      console.error('Error getting unit economics:', error);
      throw error;
    }
  }

  /**
   * Get funding efficiency
   */
  async getFundingEfficiency(ventureId) {
    try {
      const funding = await db.query(
        `SELECT SUM(raised_amount) as total_raised FROM funding_rounds WHERE venture_id = $1`,
        [ventureId]
      );

      const metrics = await db.query(
        `SELECT * FROM venture_metrics WHERE venture_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
        [ventureId]
      );

      if (!funding.rows[0].total_raised || !metrics.rows.length) {
        return null;
      }

      const totalRaised = funding.rows[0].total_raised;
      const mrr = metrics.rows[0].mrr;
      const customers = metrics.rows[0].customers;

      return {
        ventureId,
        totalRaised,
        mrr,
        customers,
        mrr_per_dollar_raised: (mrr / totalRaised).toFixed(4),
        customers_per_dollar_raised: (customers / totalRaised).toFixed(4),
        runway_months: (totalRaised / (mrr * 0.7)).toFixed(2) // Assuming 70% burn rate
      };
    } catch (error) {
      console.error('Error getting funding efficiency:', error);
      throw error;
    }
  }

  /**
   * Get market penetration
   */
  async getMarketPenetration(ventureId) {
    try {
      const venture = await db.query(
        'SELECT * FROM ventures WHERE id = $1',
        [ventureId]
      );

      const metrics = await db.query(
        `SELECT * FROM venture_metrics WHERE venture_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
        [ventureId]
      );

      if (!venture.rows.length || !metrics.rows.length) {
        return null;
      }

      const v = venture.rows[0];
      const m = metrics.rows[0];

      // Estimate TAM penetration (simplified)
      const estimatedTAMCustomers = v.market_tam / 50000; // Assume $50K average customer value
      const penetration = (m.customers / estimatedTAMCustomers * 100).toFixed(2);

      return {
        ventureId,
        tam: v.market_tam,
        customers: m.customers,
        estimatedTAMCustomers,
        penetration: penetration + '%',
        growthRate: v.market_growth_rate + '%'
      };
    } catch (error) {
      console.error('Error getting market penetration:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
