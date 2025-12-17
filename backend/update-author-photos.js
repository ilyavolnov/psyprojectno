const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function updateAuthorPhotos() {
    try {
        // Initialize SQL.js
        const SQL = await initSqlJs();

        // Load the existing database
        const dbPath = path.join(__dirname, 'database.sqlite');
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Function to update author photo in page_blocks
        function updateAuthorPhoto(pageBlocksStr) {
            if (!pageBlocksStr) {
                return pageBlocksStr;
            }

            try {
                const pageBlocks = JSON.parse(pageBlocksStr);

                // Look for 'author' blocks and update their photo field
                let updated = false;
                for (const block of pageBlocks) {
                    if (block.type === 'author' && block.data && block.data.photo) {
                        console.log(`Updating author photo from "${block.data.photo}" to "images/hero-page.webp"`);
                        block.data.photo = 'images/hero-page.webp';
                        updated = true;
                    }
                }

                return updated ? JSON.stringify(pageBlocks) : pageBlocksStr;
            } catch (error) {
                console.error('Error parsing page_blocks:', error.message);
                return pageBlocksStr; // Return original if parsing fails
            }
        }

        // Get all courses with page_blocks
        const getAllCoursesStmt = db.prepare("SELECT id, title, type, page_blocks FROM courses WHERE page_blocks IS NOT NULL AND page_blocks != ''");
        const allCourses = [];
        while (getAllCoursesStmt.step()) {
            allCourses.push(getAllCoursesStmt.getAsObject());
        }
        getAllCoursesStmt.free();

        console.log(`Found ${allCourses.length} courses with page_blocks`);

        // Process each course
        let updatedCount = 0;
        for (const course of allCourses) {
            console.log(`Processing ${course.type || 'course'}: ${course.title} (ID: ${course.id})`);

            const updatedPageBlocks = updateAuthorPhoto(course.page_blocks);

            // If page_blocks were actually changed, update the database
            if (updatedPageBlocks !== course.page_blocks) {
                const updateStmt = db.prepare(`
                    UPDATE courses
                    SET page_blocks = ?
                    WHERE id = ?
                `);
                updateStmt.run(updatedPageBlocks, course.id);
                updateStmt.free();

                console.log(`✅ Updated author photo for course ID ${course.id}`);
                updatedCount++;
            }
        }

        // Save database back to file
        const updatedBuffer = db.export();
        fs.writeFileSync(dbPath, updatedBuffer);

        console.log(`\nSummary: Updated ${updatedCount} courses with author photos.`);

        // Close the database
        db.close();
    } catch (error) {
        console.error('Error updating author photos:', error);
    }
}

// Run the update function
updateAuthorPhotos();