/**
 * AVRS Venture Replication Engine
 * Autonomous system for replicating ventures using proven playbooks
 * Enables launching 15 ventures in parallel following standardized framework
 */

const db = require('../db/connection');

class VentureReplicationEngine {
  /**
   * Create new venture from playbook
   * Replicates proven business model with customizations
   */
  async createVentureFromPlaybook(playbookId, customizations = {}) {
    try {
      // Get playbook template
      const playbook = await db.query(
        'SELECT * FROM venture_playbooks WHERE id = $1',
        [playbookId]
      );

      if (!playbook.rows.length) {
        throw new Error(`Playbook ${playbookId} not found`);
      }

      const template = playbook.rows[0];

      // Create new venture with playbook parameters
      const venture = await db.query(
        `INSERT INTO ventures 
        (name, description, market_tam, market_growth_rate, business_model, status, phase)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          customizations.name || `${template.name} - Venture ${Date.now()}`,
          customizations.description || template.description,
          customizations.tam || template.tam_minimum,
          customizations.growth_rate || 20,
          template.business_model,
          'planning',
          1
        ]
      );

      const ventureId = venture.rows[0].id;

      // Create venture phases from playbook
      await this.createVenturePhases(ventureId);

      // Create replication record
      await db.query(
        `INSERT INTO venture_replications 
        (playbook_id, target_venture_id, replication_status, customizations)
        VALUES ($1, $2, $3, $4)`,
        [playbookId, ventureId, 'in_progress', JSON.stringify(customizations)]
      );

      return venture.rows[0];
    } catch (error) {
      console.error('Error creating venture from playbook:', error);
      throw error;
    }
  }

  /**
   * Create 7-phase execution framework for venture
   */
  async createVenturePhases(ventureId) {
    try {
      const phases = [
        {
          phase_number: 1,
          phase_name: 'Preparation',
          objectives: 'Set up infrastructure for venture execution',
          deliverables: 'Holding company, executive team, legal infrastructure'
        },
        {
          phase_number: 2,
          phase_name: 'First Venture Launch',
          objectives: 'Launch first venture and validate business model',
          deliverables: 'Production-ready product, 20+ pilot customers, Series A pitch'
        },
        {
          phase_number: 3,
          phase_name: 'Product Expansion',
          objectives: 'Expand product and prepare for scaling',
          deliverables: '4+ new features, 3+ new markets, 50+ team members'
        },
        {
          phase_number: 4,
          phase_name: 'Series A Fundraising',
          objectives: 'Raise Series A funding',
          deliverables: 'Series A funding $5M+, lead investor, capital deployment'
        },
        {
          phase_number: 5,
          phase_name: 'International Expansion',
          objectives: 'Expand internationally and launch Series B',
          deliverables: 'Presence in 3+ countries, Series B funding $25M+'
        },
        {
          phase_number: 6,
          phase_name: 'IPO & Public Markets',
          objectives: 'Take venture public',
          deliverables: 'Public company status, IPO proceeds $500M+, market cap $5B+'
        },
        {
          phase_number: 7,
          phase_name: 'Portfolio Expansion',
          objectives: 'Launch additional ventures and build portfolio',
          deliverables: '15 ventures operating, $2.9M MRR, $6.5B+ enterprise value'
        }
      ];

      for (const phase of phases) {
        await db.query(
          `INSERT INTO venture_phases 
          (venture_id, phase_number, phase_name, status, objectives, deliverables)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            ventureId,
            phase.phase_number,
            phase.phase_name,
            phase.phase_number === 1 ? 'in_progress' : 'pending',
            phase.objectives,
            phase.deliverables
          ]
        );
      }

      return true;
    } catch (error) {
      console.error('Error creating venture phases:', error);
      throw error;
    }
  }

  /**
   * Get playbook steps for execution
   */
  async getPlaybookSteps(playbookId) {
    try {
      const steps = await db.query(
        `SELECT * FROM playbook_steps 
        WHERE playbook_id = $1 
        ORDER BY step_number ASC`,
        [playbookId]
      );

      return steps.rows;
    } catch (error) {
      console.error('Error getting playbook steps:', error);
      throw error;
    }
  }

  /**
   * Execute playbook step
   */
  async executePlaybookStep(ventureId, stepNumber) {
    try {
      // Get step details
      const step = await db.query(
        `SELECT ps.* FROM playbook_steps ps
        JOIN venture_replications vr ON vr.playbook_id = ps.playbook_id
        WHERE vr.target_venture_id = $1 AND ps.step_number = $2`,
        [ventureId, stepNumber]
      );

      if (!step.rows.length) {
        throw new Error(`Step ${stepNumber} not found for venture ${ventureId}`);
      }

      const stepData = step.rows[0];

      // Log execution
      await db.query(
        `INSERT INTO audit_logs (venture_id, action, actor, details)
        VALUES ($1, $2, $3, $4)`,
        [
          ventureId,
          `Execute playbook step: ${stepData.step_name}`,
          'system',
          `Step ${stepNumber}: ${stepData.description}`
        ]
      );

      return {
        success: true,
        step: stepData,
        executedAt: new Date()
      };
    } catch (error) {
      console.error('Error executing playbook step:', error);
      throw error;
    }
  }

  /**
   * Clone venture from existing venture
   */
  async cloneVenture(sourceVentureId, customizations = {}) {
    try {
      // Get source venture
      const source = await db.query(
        'SELECT * FROM ventures WHERE id = $1',
        [sourceVentureId]
      );

      if (!source.rows.length) {
        throw new Error(`Source venture ${sourceVentureId} not found`);
      }

      const sourceData = source.rows[0];

      // Create cloned venture
      const cloned = await db.query(
        `INSERT INTO ventures 
        (name, description, market_tam, market_growth_rate, competitive_advantage, 
         founder_expertise, business_model, status, phase)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          customizations.name || `${sourceData.name} - Clone ${Date.now()}`,
          customizations.description || sourceData.description,
          customizations.market_tam || sourceData.market_tam,
          customizations.market_growth_rate || sourceData.market_growth_rate,
          customizations.competitive_advantage || sourceData.competitive_advantage,
          customizations.founder_expertise || sourceData.founder_expertise,
          sourceData.business_model,
          'planning',
          1
        ]
      );

      const clonedVentureId = cloned.rows[0].id;

      // Create phases for cloned venture
      await this.createVenturePhases(clonedVentureId);

      // Record replication
      await db.query(
        `INSERT INTO venture_replications 
        (source_venture_id, target_venture_id, replication_status, customizations)
        VALUES ($1, $2, $3, $4)`,
        [sourceVentureId, clonedVentureId, 'completed', JSON.stringify(customizations)]
      );

      return cloned.rows[0];
    } catch (error) {
      console.error('Error cloning venture:', error);
      throw error;
    }
  }

  /**
   * Get replication status
   */
  async getReplicationStatus(ventureId) {
    try {
      const status = await db.query(
        `SELECT vr.*, pb.name as playbook_name, v.name as source_venture_name
        FROM venture_replications vr
        LEFT JOIN venture_playbooks pb ON vr.playbook_id = pb.id
        LEFT JOIN ventures v ON vr.source_venture_id = v.id
        WHERE vr.target_venture_id = $1`,
        [ventureId]
      );

      return status.rows[0] || null;
    } catch (error) {
      console.error('Error getting replication status:', error);
      throw error;
    }
  }

  /**
   * Get all available playbooks
   */
  async getAvailablePlaybooks() {
    try {
      const playbooks = await db.query(
        `SELECT * FROM venture_playbooks ORDER BY name ASC`
      );

      return playbooks.rows;
    } catch (error) {
      console.error('Error getting playbooks:', error);
      throw error;
    }
  }

  /**
   * Launch parallel ventures
   * Simultaneously launch multiple ventures from playbooks
   */
  async launchParallelVentures(playbookIds, count = 3) {
    try {
      const launchedVentures = [];

      for (let i = 0; i < count; i++) {
        const playbookId = playbookIds[i % playbookIds.length];
        const customizations = {
          name: `Venture Wave ${Math.ceil((i + 1) / playbookIds.length)} - ${i + 1}`
        };

        const venture = await this.createVentureFromPlaybook(playbookId, customizations);
        launchedVentures.push(venture);
      }

      return launchedVentures;
    } catch (error) {
      console.error('Error launching parallel ventures:', error);
      throw error;
    }
  }

  /**
   * Get venture execution roadmap
   */
  async getExecutionRoadmap(ventureId) {
    try {
      const phases = await db.query(
        `SELECT * FROM venture_phases 
        WHERE venture_id = $1 
        ORDER BY phase_number ASC`,
        [ventureId]
      );

      const roadmap = {
        ventureId,
        totalPhases: phases.rows.length,
        phases: phases.rows.map(phase => ({
          number: phase.phase_number,
          name: phase.phase_name,
          status: phase.status,
          objectives: phase.objectives,
          deliverables: phase.deliverables,
          successMetrics: phase.success_metrics
        }))
      };

      return roadmap;
    } catch (error) {
      console.error('Error getting execution roadmap:', error);
      throw error;
    }
  }

  /**
   * Update venture phase status
   */
  async updatePhaseStatus(ventureId, phaseNumber, status) {
    try {
      const result = await db.query(
        `UPDATE venture_phases 
        SET status = $1, end_date = CURRENT_TIMESTAMP
        WHERE venture_id = $2 AND phase_number = $3
        RETURNING *`,
        [status, ventureId, phaseNumber]
      );

      if (!result.rows.length) {
        throw new Error(`Phase ${phaseNumber} not found for venture ${ventureId}`);
      }

      // Log phase completion
      if (status === 'completed') {
        await db.query(
          `INSERT INTO audit_logs (venture_id, action, actor, details)
          VALUES ($1, $2, $3, $4)`,
          [
            ventureId,
            `Phase ${phaseNumber} completed`,
            'system',
            `${result.rows[0].phase_name} phase completed successfully`
          ]
        );
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating phase status:', error);
      throw error;
    }
  }

  /**
   * Get venture replication metrics
   */
  async getReplicationMetrics() {
    try {
      const metrics = await db.query(
        `SELECT 
          COUNT(DISTINCT vr.target_venture_id) as total_replications,
          COUNT(DISTINCT CASE WHEN vr.replication_status = 'completed' THEN vr.target_venture_id END) as completed,
          COUNT(DISTINCT CASE WHEN vr.replication_status = 'in_progress' THEN vr.target_venture_id END) as in_progress,
          COUNT(DISTINCT CASE WHEN vr.replication_status = 'planning' THEN vr.target_venture_id END) as planning
        FROM venture_replications vr`
      );

      return metrics.rows[0];
    } catch (error) {
      console.error('Error getting replication metrics:', error);
      throw error;
    }
  }
}

module.exports = new VentureReplicationEngine();
