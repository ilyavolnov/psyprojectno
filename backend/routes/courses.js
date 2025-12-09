const express = require('express');
const router = express.Router();
const { prepare, saveDatabase } = require('../database');

// Generate slug from title
function generateSlug(title) {
    const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return title
        .toLowerCase()
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM courses';
        const params = [];
        
        if (type) {
            query += ' WHERE type = ?';
            params.push(type);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const courses = await prepare(query).all(...params);
        
        // Parse JSON fields and generate slug if missing
        const parsedCourses = courses.map(course => {
            const slug = course.slug || generateSlug(course.title);
            return {
                ...course,
                slug,
                topics: course.topics ? JSON.parse(course.topics) : [],
                has_certificate: Boolean(course.has_certificate)
            };
        });

        res.json({
            success: true,
            data: parsedCourses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses'
        });
    }
});

// Get course by slug
router.get('/courses/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const course = await prepare('SELECT * FROM courses WHERE slug = ?').get(slug);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Parse JSON fields
        course.topics = course.topics ? JSON.parse(course.topics) : [];
        course.has_certificate = Boolean(course.has_certificate);
        // Keep page_blocks as string for frontend to parse

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course'
        });
    }
});

// Get single course
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prepare('SELECT * FROM courses WHERE id = ?').get(id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Parse JSON fields
        course.topics = course.topics ? JSON.parse(course.topics) : [];
        course.has_certificate = Boolean(course.has_certificate);

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course'
        });
    }
});

// Create course
router.post('/courses', async (req, res) => {
    try {
        const {
            title, subtitle, description, price, status, image,
            release_date, access_duration, feedback_duration,
            has_certificate, whatsapp_number, topics, bonuses,
            materials, author_name, author_description, page_blocks, type
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const slug = generateSlug(title);

        const query = `
            INSERT INTO courses (
                title, subtitle, description, price, status, image,
                release_date, access_duration, feedback_duration,
                has_certificate, whatsapp_number, topics, bonuses,
                materials, author_name, author_description, page_blocks, type, slug, start_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await prepare(query).run(
            title, subtitle, description, price || 0, status || 'available', image,
            release_date, access_duration, feedback_duration,
            has_certificate ? 1 : 0, whatsapp_number,
            topics ? JSON.stringify(topics) : '[]',
            bonuses, materials, author_name, author_description,
            page_blocks || '[]',
            type || 'course',
            slug,
            start_date || null
        );

        saveDatabase();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create course'
        });
    }
});

// Update course
router.put('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (key === 'topics' && updates[key]) {
                fields.push(`${key} = ?`);
                values.push(JSON.stringify(updates[key]));
            } else if (key === 'has_certificate') {
                fields.push(`${key} = ?`);
                values.push(updates[key] ? 1 : 0);
            } else if (updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        fields.push('updated_at = datetime(\'now\')');
        values.push(id);

        const query = `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`;
        await prepare(query).run(...values);
        saveDatabase();

        res.json({
            success: true,
            message: 'Course updated successfully'
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update course'
        });
    }
});

// Delete course
router.delete('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prepare('DELETE FROM courses WHERE id = ?').run(id);
        saveDatabase();

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete course'
        });
    }
});

module.exports = router;
