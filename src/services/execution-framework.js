/**
 * AVRS 7-Phase Execution Framework
 * Guides ventures through structured growth from preparation to portfolio expansion
 * Days 1-470: From startup to $6.5B+ enterprise value
 */

const db = require('../db/connection');

class ExecutionFramework {
  /**
   * Get 7-phase framework definition
   */
  getFrameworkDefinition() {
    return [
      {
        phase: 1,
        name: 'Preparation',
        days: '1-4',
        duration: 4,
        objectives: 'Set up infrastructure for venture execution',
        deliverables: [
          'Holding company established',
          'Executive team hired (CEO, CTO, CFO, VP Sales, VP Marketing)',
          'Legal infrastructure setup',
          'Board of directors formed',
          'Governance structure defined'
        ],
        successCriteria: [
          'Team hired 100%',
          'Legal setup 100%',
          'Governance defined',
          'Capital allocated'
        ],
        keyMetrics: {
          teamSize: 5,
          capitalRaised: 0,
          customers: 0,
          mrr: 0
        }
      },
      {
        phase: 2,
        name: 'First Venture Launch',
        days: '5-28',
        duration: 24,
        objectives: 'Launch first venture and validate business model',
        deliverables: [
          'MVP built and deployed',
          '20+ pilot customers acquired',
          'Product-market fit validated',
          'Series A pitch deck created',
          'Revenue model proven'
        ],
        successCriteria: [
          'Customers: 20+',
          'MRR: $5K+',
          'CSAT: 4.5+/5',
          'Retention: 90%+'
        ],
        keyMetrics: {
          teamSize: 15,
          capitalRaised: 2000000,
          customers: 20,
          mrr: 5000
        }
      },
      {
        phase: 3,
        name: 'Product Expansion',
        days: '29-110',
        duration: 82,
        objectives: 'Expand first venture and prepare for scaling',
        deliverables: [
          '4+ new features launched',
          '3+ new markets entered',
          '50+ new team members hired',
          'Series B pitch deck created',
          'International expansion planned'
        ],
        successCriteria: [
          'Customers: 100+',
          'MRR: $50K+',
          'Growth: 50%+ MoM',
          'NPS: 60+'
        ],
        keyMetrics: {
          teamSize: 65,
          capitalRaised: 10000000,
          customers: 100,
          mrr: 50000
        }
      },
      {
        phase: 4,
        name: 'Series A Fundraising',
        days: '111-150',
        duration: 40,
        objectives: 'Raise Series A funding for first venture',
        deliverables: [
          'Series A funding: $5M+',
          'Lead investor secured',
          'Capital deployment plan',
          'Valuation: $50M+',
          'Investor board seat'
        ],
        successCriteria: [
          'Funding: $5M+',
          'Valuation: $50M+',
          'Dilution: <15%',
          'Runway: 24+ months'
        ],
        keyMetrics: {
          teamSize: 100,
          capitalRaised: 5000000,
          customers: 200,
          mrr: 150000
        }
      },
      {
        phase: 5,
        name: 'International Expansion',
        days: '151-210',
        duration: 60,
        objectives: 'Expand internationally and launch Series B',
        deliverables: [
          'Presence in 3+ countries',
          'Series B funding: $25M+',
          'Global team: 200+ members',
          'International revenue: 30%+',
          'IPO readiness assessment'
        ],
        successCriteria: [
          'International customers: 100+',
          'Series B: $25M+',
          'Valuation: $250M+',
          'Global team: 200+'
        ],
        keyMetrics: {
          teamSize: 200,
          capitalRaised: 25000000,
          customers: 500,
          mrr: 500000
        }
      },
      {
        phase: 6,
        name: 'IPO & Public Markets',
        days: '211-270',
        duration: 60,
        objectives: 'Take first venture public',
        deliverables: [
          'Public company status',
          'IPO proceeds: $500M+',
          'Market cap: $5B+',
          'Quarterly earnings reports',
          'Investor relations program'
        ],
        successCriteria: [
          'IPO price: $30+/share',
          'Market cap: $5B+',
          'Customers: 2,000+',
          'MRR: $2M+'
        ],
        keyMetrics: {
          teamSize: 500,
          capitalRaised: 500000000,
          customers: 2000,
          mrr: 2000000
        }
      },
      {
        phase: 7,
        name: 'Portfolio Expansion',
        days: '271-470',
        duration: 200,
        objectives: 'Launch additional ventures and build portfolio',
        deliverables: [
          '15 ventures operating',
          'Holding company IPO',
          'Portfolio MRR: $2.9M',
          'Enterprise value: $6.5B+',
          'Team: 1,395+ members'
        ],
        successCriteria: [
          'Ventures: 15',
          'Customers: 3,680+',
          'MRR: $2.9M',
          'Enterprise value: $6.5B+'
        ],
        keyMetrics: {
          teamSize: 1395,
          capitalRaised: 200000000,
          customers: 3680,
          mrr: 2900000
        }
      }
    ];
  }

  /**
   * Get current phase for venture
   */
  async getCurrentPhase(ventureId) {
    try {
      const venture = await db.query(
        'SELECT phase FROM ventures WHERE id = $1',
        [ventureId]
      );

      if (!venture.rows.length) {
        throw new Error(`Venture ${ventureId} not found`);
      }

      const phaseNumber = venture.rows[0].phase;
      const framework = this.getFrameworkDefinition();
      return framework[phaseNumber - 1];
    } catch (error) {
      console.error('Error getting current phase:', error);
      throw error;
    }
  }

  /**
   * Get phase progress
   */
  async getPhaseProgress(ventureId) {
    try {
      const phases = await db.query(
        `SELECT * FROM venture_phases 
        WHERE venture_id = $1 
        ORDER BY phase_number ASC`,
        [ventureId]
      );

      const progress = phases.rows.map(phase => ({
        number: phase.phase_number,
        name: phase.phase_name,
        status: phase.status,
        progress: phase.status === 'completed' ? 100 : phase.status === 'in_progress' ? 50 : 0
      }));

      return progress;
    } catch (error) {
      console.error('Error getting phase progress:', error);
      throw error;
    }
  }

  /**
   * Advance venture to next phase
   */
  async advancePhase(ventureId) {
    try {
      // Get current venture
      const venture = await db.query(
        'SELECT * FROM ventures WHERE id = $1',
        [ventureId]
      );

      if (!venture.rows.length) {
        throw new Error(`Venture ${ventureId} not found`);
      }

      const current = venture.rows[0];
      const nextPhase = current.phase + 1;

      if (nextPhase > 7) {
        throw new Error('Venture has completed all 7 phases');
      }

      // Update venture phase
      const updated = await db.query(
        `UPDATE ventures 
        SET phase = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *`,
        [ventureId, nextPhase]
      );

      // Update phase status
      await db.query(
        `UPDATE venture_phases 
        SET status = 'in_progress'
        WHERE venture_id = $1 AND phase_number = $2`,
        [ventureId, nextPhase]
      );

      // Mark previous phase as completed
      await db.query(
        `UPDATE venture_phases 
        SET status = 'completed', end_date = CURRENT_TIMESTAMP
        WHERE venture_id = $1 AND phase_number = $2`,
        [ventureId, current.phase]
      );

      // Log phase advancement
      await db.query(
        `INSERT INTO audit_logs (venture_id, action, actor, details)
        VALUES ($1, $2, $3, $4)`,
        [
          ventureId,
          `Advance to phase ${nextPhase}`,
          'system',
          `Venture advanced from phase ${current.phase} to phase ${nextPhase}`
        ]
      );

      return updated.rows[0];
    } catch (error) {
      console.error('Error advancing phase:', error);
      throw error;
    }
  }

  /**
   * Check if venture meets phase success criteria
   */
  async checkPhaseCompletion(ventureId) {
    try {
      const metrics = await db.query(
        `SELECT * FROM venture_metrics 
        WHERE venture_id = $1 
        ORDER BY recorded_at DESC LIMIT 1`,
        [ventureId]
      );

      const venture = await db.query(
        'SELECT * FROM ventures WHERE id = $1',
        [ventureId]
      );

      if (!metrics.rows.length || !venture.rows.length) {
        return { ready: false, reason: 'Insufficient data' };
      }

      const m = metrics.rows[0];
      const v = venture.rows[0];
      const framework = this.getFrameworkDefinition();
      const currentPhase = framework[v.phase - 1];

      // Check success criteria
      const checks = {
        customersTarget: m.customers >= (currentPhase.keyMetrics.customers || 0),
        mrrTarget: m.mrr >= (currentPhase.keyMetrics.mrr || 0),
        retentionTarget: m.retention_rate >= 0.9,
        npsTarget: m.nps_score >= 50
      };

      const allMet = Object.values(checks).every(v => v);

      return {
        ready: allMet,
        checks,
        currentPhase: v.phase,
        nextPhase: v.phase + 1
      };
    } catch (error) {
      console.error('Error checking phase completion:', error);
      throw error;
    }
  }

  /**
   * Get roadmap for venture
   */
  async getVentureRoadmap(ventureId) {
    try {
      const venture = await db.query(
        'SELECT * FROM ventures WHERE id = $1',
        [ventureId]
      );

      if (!venture.rows.length) {
        throw new Error(`Venture ${ventureId} not found`);
      }

      const v = venture.rows[0];
      const framework = this.getFrameworkDefinition();

      const roadmap = {
        ventureId,
        ventureName: v.name,
        currentPhase: v.phase,
        totalPhases: 7,
        phases: framework.map((phase, index) => ({
          ...phase,
          status: index + 1 < v.phase ? 'completed' : index + 1 === v.phase ? 'current' : 'upcoming'
        }))
      };

      return roadmap;
    } catch (error) {
      console.error('Error getting venture roadmap:', error);
      throw error;
    }
  }

  /**
   * Get portfolio execution timeline
   */
  async getPortfolioTimeline() {
    try {
      const ventures = await db.query(
        `SELECT v.id, v.name, v.phase, vm.customers, vm.mrr, vm.recorded_at
        FROM ventures v
        LEFT JOIN venture_metrics vm ON v.id = vm.venture_id
        ORDER BY v.id ASC`
      );

      const framework = this.getFrameworkDefinition();

      const timeline = {
        totalVentures: ventures.rows.length,
        ventures: ventures.rows.map(v => ({
          id: v.id,
          name: v.name,
          currentPhase: v.phase,
          phaseInfo: framework[v.phase - 1],
          metrics: {
            customers: v.customers || 0,
            mrr: v.mrr || 0
          }
        }))
      };

      return timeline;
    } catch (error) {
      console.error('Error getting portfolio timeline:', error);
      throw error;
    }
  }

  /**
   * Get phase tasks
   */
  async getPhaseTasks(phaseNumber) {
    try {
      const tasks = await db.query(
        `SELECT * FROM phase_tasks 
        WHERE phase_id = (SELECT id FROM execution_phases WHERE phase_number = $1)
        ORDER BY task_number ASC`,
        [phaseNumber]
      );

      return tasks.rows;
    } catch (error) {
      console.error('Error getting phase tasks:', error);
      throw error;
    }
  }

  /**
   * Get execution summary
   */
  async getExecutionSummary() {
    try {
      const summary = await db.query(
        `SELECT 
          COUNT(DISTINCT v.id) as total_ventures,
          SUM(CASE WHEN v.phase = 1 THEN 1 ELSE 0 END) as phase_1_count,
          SUM(CASE WHEN v.phase = 2 THEN 1 ELSE 0 END) as phase_2_count,
          SUM(CASE WHEN v.phase = 3 THEN 1 ELSE 0 END) as phase_3_count,
          SUM(CASE WHEN v.phase >= 4 THEN 1 ELSE 0 END) as phase_4_plus_count,
          SUM(vm.customers) as total_customers,
          SUM(vm.mrr) as total_mrr,
          AVG(vm.growth_rate_mom) as avg_growth_rate,
          AVG(vm.retention_rate) as avg_retention_rate
        FROM ventures v
        LEFT JOIN venture_metrics vm ON v.id = vm.venture_id`
      );

      return summary.rows[0];
    } catch (error) {
      console.error('Error getting execution summary:', error);
      throw error;
    }
  }
}

module.exports = new ExecutionFramework();
