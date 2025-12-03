// Requests API Routes
const express = require('express');
const router = express.Router();
const { prepare } = require('../database');
const { notifyNewApplication } = require('../bot');

// Get all requests with filters
router.get('/requests', async (req, res) => {
    try {
        const { status, type, specialistId, tab = 'all' } = req.query;
        
        let query = 'SELECT * FROM requests WHERE 1=1';
        const params = [];

        // Filter by tab
        if (tab === 'archive') {
            query += ' AND archived = 1';
        } else if (tab === 'deleted') {
            query += ' AND deleted = 1';
        } else {
            query += ' AND archived = 0 AND deleted = 0';
        }

        // Filter by status
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        // Filter by type
        if (type) {
            query += ' AND request_type = ?';
            params.push(type);
        }

        // Filter by specialist
        if (specialistId) {
            query += ' AND specialist_id = ?';
            params.push(specialistId);
        }

        query += ' ORDER BY created_at DESC';

        const requests = await prepare(query).all(...params);
        
        res.json({
            success: true,
            data: requests,
            count: requests.length
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch requests'
        });
    }
});

// Get single request by ID
router.get('/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = await prepare('SELECT * FROM requests WHERE id = ?').get(id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch request'
        });
    }
});

// Create new request
router.post('/requests', async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            request_type,
            specialist_id,
            message,
            course_id,
            certificate_amount
        } = req.body;

        // Validate required fields
        if (!name || !phone || !request_type) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const query = `
            INSERT INTO requests (
                name, phone, email, request_type, specialist_id,
                message, course_id, certificate_amount, status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'), datetime('now'))
        `;

        const result = await prepare(query).run(
            name,
            phone,
            email || null,
            request_type,
            specialist_id || null,
            message || null,
            course_id || null,
            certificate_amount || null
        );

        const requestId = result.lastInsertRowid;

        // Get the created request for notification
        const newRequest = await prepare('SELECT * FROM requests WHERE id = ?').get(requestId);
        
        // Send Telegram notification
        if (newRequest) {
            try {
                notifyNewApplication(newRequest);
            } catch (error) {
                console.error('Error sending Telegram notification:', error);
                // Don't fail the request if notification fails
            }
        }

        res.status(201).json({
            success: true,
            data: {
                id: requestId,
                message: 'Request created successfully'
            }
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create request'
        });
    }
});

// Update request
router.put('/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, specialist_id } = req.body;

        const updates = [];
        const params = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (specialist_id !== undefined) {
            updates.push('specialist_id = ?');
            params.push(specialist_id);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updates.push('updated_at = datetime(\'now\')');
        params.push(id);

        const query = `UPDATE requests SET ${updates.join(', ')} WHERE id = ?`;
        
        await prepare(query).run(...params);

        res.json({
            success: true,
            message: 'Request updated successfully'
        });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update request'
        });
    }
});

// Archive request (or remove from archive)
router.put('/requests/:id/archive', async (req, res) => {
    try {
        const { id } = req.params;
        const { remove } = req.query;
        
        // Check current status
        const request = await prepare('SELECT archived, deleted FROM requests WHERE id = ?').get(id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }
        
        // If remove flag is set or already archived, remove from archive (move to trash)
        if (remove === 'true' || request.archived === 1) {
            await prepare('UPDATE requests SET archived = 0, deleted = 1, updated_at = datetime(\'now\') WHERE id = ?').run(id);
            res.json({
                success: true,
                message: 'Request removed from archive'
            });
        } else {
            // Archive the request
            await prepare('UPDATE requests SET archived = 1, deleted = 0, updated_at = datetime(\'now\') WHERE id = ?').run(id);
            res.json({
                success: true,
                message: 'Request archived successfully'
            });
        }
    } catch (error) {
        console.error('Error archiving request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to archive request'
        });
    }
});

// Restore request from archive/trash
router.put('/requests/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prepare('UPDATE requests SET archived = 0, deleted = 0, updated_at = datetime(\'now\') WHERE id = ?').run(id);

        res.json({
            success: true,
            message: 'Request restored successfully'
        });
    } catch (error) {
        console.error('Error restoring request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restore request'
        });
    }
});

// Delete request (soft delete or permanent delete)
router.delete('/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent } = req.query;
        
        // Check if request is already in trash
        const request = await prepare('SELECT deleted FROM requests WHERE id = ?').get(id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }
        
        // If already deleted or permanent flag is set, delete permanently
        if (request.deleted === 1 || permanent === 'true') {
            await prepare('DELETE FROM requests WHERE id = ?').run(id);
            res.json({
                success: true,
                message: 'Request permanently deleted'
            });
        } else {
            // Soft delete - move to trash
            await prepare('UPDATE requests SET deleted = 1, updated_at = datetime(\'now\') WHERE id = ?').run(id);
            res.json({
                success: true,
                message: 'Request moved to trash'
            });
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete request'
        });
    }
});

// Get statistics
router.get('/requests/stats/summary', async (req, res) => {
    try {
        const stats = {
            total: await prepare('SELECT COUNT(*) as count FROM requests WHERE deleted = 0 AND archived = 0').get(),
            new: await prepare('SELECT COUNT(*) as count FROM requests WHERE status = "new" AND deleted = 0 AND archived = 0').get(),
            pending: await prepare('SELECT COUNT(*) as count FROM requests WHERE status = "pending" AND deleted = 0 AND archived = 0').get(),
            completed: await prepare('SELECT COUNT(*) as count FROM requests WHERE status = "completed" AND deleted = 0 AND archived = 0').get(),
            archived: await prepare('SELECT COUNT(*) as count FROM requests WHERE archived = 1 AND deleted = 0').get(),
            deleted: await prepare('SELECT COUNT(*) as count FROM requests WHERE deleted = 1').get()
        };

        res.json({
            success: true,
            data: {
                total: stats.total.count,
                new: stats.new.count,
                pending: stats.pending.count,
                completed: stats.completed.count,
                archived: stats.archived.count,
                deleted: stats.deleted.count
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
