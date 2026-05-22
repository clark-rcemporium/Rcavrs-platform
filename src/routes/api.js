/**
 * AVRS API Routes
 * Express.js routes for AVRS platform
 */

const express = require('express');
const router = express.Router();
const ventureReplication = require('../services/venture-replication');
const autonomousOps = require('../services/autonomous-operations');
const executionFramework = require('../services/execution-framework');
const analytics = require('../services/analytics');

// ============================================================================
// VENTURE ROUTES
// ============================================================================

/**
 * GET /api/ventures
 * Get all ventures
 */
router.get('/ventures', async (req, res) => {
  try {
    const ventures = await ventureReplication.getAvailablePlaybooks();
    res.json({ success: true, ventures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ventures
 * Create new venture from playbook
 */
router.post('/ventures', async (req, res) => {
  try {
    const { playbookId, customizations } = req.body;
    const venture = await ventureReplication.createVentureFromPlaybook(playbookId, customizations);
    res.json({ success: true, venture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ventures/:id
 * Get venture details
 */
router.get('/ventures/:id', async (req, res) => {
  try {
    const roadmap = await executionFramework.getVentureRoadmap(req.params.id);
    res.json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ventures/:id/advance-phase
 * Advance venture to next phase
 */
router.post('/ventures/:id/advance-phase', async (req, res) => {
  try {
    const venture = await executionFramework.advancePhase(req.params.id);
    res.json({ success: true, venture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// REPLICATION ROUTES
// ============================================================================

/**
 * POST /api/replicate/launch-wave
 * Launch parallel ventures
 */
router.post('/replicate/launch-wave', async (req, res) => {
  try {
    const { playbookIds, count } = req.body;
    const ventures = await ventureReplication.launchParallelVentures(playbookIds, count);
    res.json({ success: true, ventures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/replicate/clone
 * Clone existing venture
 */
router.post('/replicate/clone', async (req, res) => {
  try {
    const { sourceVentureId, customizations } = req.body;
    const venture = await ventureReplication.cloneVenture(sourceVentureId, customizations);
    res.json({ success: true, venture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// OPERATIONS ROUTES
// ============================================================================

/**
 * POST /api/operations/:ventureId/initialize
 * Initialize autonomous operations
 */
router.post('/operations/:ventureId/initialize', async (req, res) => {
  try {
    const { ventureId } = req.params;
    
    // Initialize all autonomous systems
    await autonomousOps.initializeSalesPipeline(ventureId);
    await autonomousOps.activateCustomerSuccess(ventureId);
    await autonomousOps.launchMarketingCampaign(ventureId);
    
    const status = await autonomousOps.getOperationsStatus(ventureId);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/operations/:ventureId/status
 * Get operations status
 */
router.get('/operations/:ventureId/status', async (req, res) => {
  try {
    const status = await autonomousOps.getOperationsStatus(req.params.ventureId);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/operations/:ventureId/execute-cycle
 * Execute one autonomous operations cycle
 */
router.post('/operations/:ventureId/execute-cycle', async (req, res) => {
  try {
    const { ventureId } = req.params;
    
    // Execute all autonomous operations
    const sales = await autonomousOps.executeLeadGeneration(ventureId);
    const cs = await autonomousOps.executeCustomerOnboarding(ventureId);
    const retention = await autonomousOps.executeCustomerRetention(ventureId);
    const revenue = await autonomousOps.executeRevenueOptimization(ventureId);
    
    res.json({ success: true, results: { sales, cs, retention, revenue } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

/**
 * POST /api/analytics/:ventureId/metrics
 * Record venture metrics
 */
router.post('/analytics/:ventureId/metrics', async (req, res) => {
  try {
    const metrics = await analytics.recordMetrics(req.params.ventureId, req.body);
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/:ventureId/history
 * Get metrics history
 */
router.get('/analytics/:ventureId/history', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const history = await analytics.getMetricsHistory(req.params.ventureId, days);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/:ventureId/unit-economics
 * Get unit economics
 */
router.get('/analytics/:ventureId/unit-economics', async (req, res) => {
  try {
    const unitEconomics = await analytics.getUnitEconomics(req.params.ventureId);
    res.json({ success: true, unitEconomics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/:ventureId/growth
 * Get growth analysis
 */
router.get('/analytics/:ventureId/growth', async (req, res) => {
  try {
    const days = req.query.days || 90;
    const growth = await analytics.getGrowthAnalysis(req.params.ventureId, days);
    res.json({ success: true, growth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/portfolio
 * Get portfolio analytics
 */
router.get('/analytics/portfolio', async (req, res) => {
  try {
    const metrics = await analytics.calculatePortfolioMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/cohort
 * Get cohort analysis
 */
router.get('/analytics/cohort', async (req, res) => {
  try {
    const cohorts = await analytics.getCohortAnalysis();
    res.json({ success: true, cohorts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// EXECUTION FRAMEWORK ROUTES
// ============================================================================

/**
 * GET /api/framework/definition
 * Get 7-phase framework definition
 */
router.get('/framework/definition', (req, res) => {
  try {
    const framework = executionFramework.getFrameworkDefinition();
    res.json({ success: true, framework });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/framework/:ventureId/roadmap
 * Get venture execution roadmap
 */
router.get('/framework/:ventureId/roadmap', async (req, res) => {
  try {
    const roadmap = await executionFramework.getVentureRoadmap(req.params.ventureId);
    res.json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/framework/portfolio/timeline
 * Get portfolio execution timeline
 */
router.get('/framework/portfolio/timeline', async (req, res) => {
  try {
    const timeline = await executionFramework.getPortfolioTimeline();
    res.json({ success: true, timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/framework/summary
 * Get execution summary
 */
router.get('/framework/summary', async (req, res) => {
  try {
    const summary = await executionFramework.getExecutionSummary();
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AVRS Platform',
    version: '1.0.0'
  });
});

module.exports = router;
