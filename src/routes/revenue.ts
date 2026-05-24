/**
 * AVRS Revenue API Routes
 * Revenue generation, cash flow metrics, and opportunity management
 */

import express, { Request, Response } from 'express';
import revenueEngine from '../services/revenue-engine';

const router = express.Router();

/**
 * GET /api/revenue/opportunities
 * Get all revenue opportunities
 */
router.get('/opportunities', async (req: Request, res: Response) => {
  try {
    const opportunities = await revenueEngine.scanRevenueOpportunities();
    res.json({
      success: true,
      count: opportunities.length,
      opportunities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan opportunities'
    });
  }
});

/**
 * GET /api/revenue/metrics
 * Get cash flow metrics and revenue dashboard data
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await revenueEngine.getRevenueMetrics();
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate metrics'
    });
  }
});

/**
 * GET /api/revenue/execution-plan
 * Get 90-day revenue execution plan
 */
router.get('/execution-plan', async (req: Request, res: Response) => {
  try {
    const plan = await revenueEngine.generateRevenueExecutionPlan();
    res.json({
      success: true,
      plan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate plan'
    });
  }
});

/**
 * GET /api/revenue/outreach/:opportunityId
 * Get outreach sequence for opportunity
 */
router.get('/outreach/:opportunityId', async (req: Request, res: Response) => {
  try {
    const { opportunityId } = req.params;
    const sequence = await revenueEngine.generateOutreachSequence(opportunityId);
    res.json({
      success: true,
      opportunityId,
      sequence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate outreach'
    });
  }
});

/**
 * GET /api/revenue/dashboard
 * Complete revenue dashboard data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const opportunities = await revenueEngine.scanRevenueOpportunities();
    const metrics = await revenueEngine.getRevenueMetrics();
    const plan = await revenueEngine.generateRevenueExecutionPlan();

    res.json({
      success: true,
      data: {
        opportunities,
        metrics,
        executionPlan: plan,
        status: 'active',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load dashboard'
    });
  }
});

/**
 * POST /api/revenue/validate-opportunity
 * Validate and score an opportunity
 */
router.post('/validate-opportunity', async (req: Request, res: Response) => {
  try {
    const { name, customerPain, revenueModel, estimatedMRR, probability } = req.body;

    // Validation logic
    if (!name || !customerPain || !revenueModel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, customerPain, revenueModel'
      });
    }

    if (probability < 0 || probability > 1) {
      return res.status(400).json({
        success: false,
        error: 'Probability must be between 0 and 1'
      });
    }

    // Score the opportunity
    const score = {
      realityScore: probability > 0.7 ? 'HIGH' : probability > 0.4 ? 'MEDIUM' : 'LOW',
      timeToFirstCash: estimatedMRR > 50000 ? 7 : 14,
      expectedMRR: estimatedMRR * probability,
      recommendation: probability > 0.7 ? 'EXECUTE_NOW' : probability > 0.4 ? 'VALIDATE_FIRST' : 'RESEARCH_MORE'
    };

    res.json({
      success: true,
      opportunity: {
        name,
        customerPain,
        revenueModel,
        estimatedMRR,
        probability
      },
      score,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate opportunity'
    });
  }
});

export default router;
