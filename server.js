/**
 * Manus MCP Server - خادم MCP كامل لربط Manus بجهازك المحلي
 * يوفر صلاحيات كاملة: ملفات، أوامر، Git، وأكثر
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');
const crypto = require('crypto');

const execPromise = util.promisify(exec);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ==================== التكوين ====================
const CONFIG = {
    PORT: process.env.PORT || 3000,
    API_KEY: process.env.API_KEY || 'manus-local-' + crypto.randomBytes(16).toString('hex'),
    WORKSPACE: process.env.WORKSPACE || process.cwd(),
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// ==================== المصادقة ====================
const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (apiKey !== CONFIG.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized - Invalid API Key' });
    }
    next();
};

// ==================== أدوات MCP ====================

/**
 * قائمة الأدوات المتاحة
 */
const TOOLS = [
    {
        name: 'read_file',
        description: 'قراءة محتوى ملف من الجهاز المحلي',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'مسار الملف الكامل' }
            },
            required: ['path']
        }
    },
    {
        name: 'write_file',
        description: 'كتابة محتوى إلى ملف على الجهاز المحلي',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'مسار الملف الكامل' },
                content: { type: 'string', description: 'المحتوى المراد كتابته' }
            },
            required: ['path', 'content']
        }
    },
    {
        name: 'list_directory',
        description: 'عرض محتويات مجلد',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'مسار المجلد' }
            },
            required: ['path']
        }
    },
    {
        name: 'create_directory',
        description: 'إنشاء مجلد جديد',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'مسار المجلد الجديد' }
            },
            required: ['path']
        }
    },
    {
        name: 'delete_file',
        description: 'حذف ملف أو مجلد',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'مسار الملف أو المجلد' }
            },
            required: ['path']
        }
    },
    {
        name: 'move_file',
        description: 'نقل أو إعادة تسمية ملف',
        parameters: {
            type: 'object',
            properties: {
                source: { type: 'string', description: 'المسار الأصلي' },
                destination: { type: 'string', description: 'المسار الجديد' }
            },
            required: ['source', 'destination']
        }
    },
    {
        name: 'copy_file',
        description: 'نسخ ملف أو مجلد',
        parameters: {
            type: 'object',
            properties: {
                source: { type: 'string', description: 'المسار الأصلي' },
                destination: { type: 'string', description: 'مسار النسخة' }
            },
            required: ['source', 'destination']
        }
    },
    {
        name: 'execute_command',
        description: 'تنفيذ أمر في CMD أو PowerShell',
        parameters: {
            type: 'object',
            properties: {
                command: { type: 'string', description: 'الأمر المراد تنفيذه' },
                cwd: { type: 'string', description: 'مجلد العمل (اختياري)' },
                shell: { type: 'string', enum: ['cmd', 'powershell'], description: 'نوع الشل' }
            },
            required: ['command']
        }
    },
    {
        name: 'git_command',
        description: 'تنفيذ أمر Git',
        parameters: {
            type: 'object',
            properties: {
                command: { type: 'string', description: 'أمر Git (بدون كلمة git)' },
                cwd: { type: 'string', description: 'مسار المستودع' }
            },
            required: ['command']
        }
    },
    {
        name: 'search_files',
        description: 'البحث عن ملفات بنمط معين',
        parameters: {
            type: 'object',
            properties: {
                directory: { type: 'string', description: 'مجلد البحث' },
                pattern: { type: 'string', description: 'نمط البحث (مثل *.js)' }
            },
            required: ['directory', 'pattern']
        }
    },
    {
        name: 'search_in_files',
        description: 'البحث عن نص داخل الملفات',
        parameters: {
            type: 'object',
            properties: {
                directory: { type: 'string', description: 'مجلد البحث' },
                text: { type: 'string', description: 'النص المراد البحث عنه' },
                extension: { type: 'string', description: 'امتداد الملفات (اختياري)' }
            },
            required: ['directory', 'text']
        }
    },
    {
        name: 'get_system_info',
        description: 'الحصول على معلومات النظام',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'npm_command',
        description: 'تنفيذ أمر npm',
        parameters: {
            type: 'object',
            properties: {
                command: { type: 'string', description: 'أمر npm (بدون كلمة npm)' },
                cwd: { type: 'string', description: 'مجلد المشروع' }
            },
            required: ['command']
        }
    },
    {
        name: 'python_command',
        description: 'تنفيذ سكريبت Python',
        parameters: {
            type: 'object',
            properties: {
                script: { type: 'string', description: 'كود Python أو مسار الملف' },
                cwd: { type: 'string', description: 'مجلد العمل' }
            },
            required: ['script']
        }
    }
];

// ==================== تنفيذ الأدوات ====================

const toolHandlers = {
    // قراءة ملف
    async read_file({ path: filePath }) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return { success: true, content, size: content.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // كتابة ملف
    async write_file({ path: filePath, content }) {
        try {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, content, 'utf-8');
            return { success: true, message: `File written: ${filePath}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // عرض محتويات مجلد
    async list_directory({ path: dirPath }) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            const result = await Promise.all(items.map(async (item) => {
                const fullPath = path.join(dirPath, item.name);
                let stats = null;
                try {
                    stats = await fs.stat(fullPath);
                } catch (e) {}
                return {
                    name: item.name,
                    type: item.isDirectory() ? 'directory' : 'file',
                    size: stats ? stats.size : null,
                    modified: stats ? stats.mtime : null
                };
            }));
            return { success: true, items: result, count: result.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // إنشاء مجلد
    async create_directory({ path: dirPath }) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            return { success: true, message: `Directory created: ${dirPath}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // حذف ملف أو مجلد
    async delete_file({ path: filePath }) {
        try {
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                await fs.rm(filePath, { recursive: true });
            } else {
                await fs.unlink(filePath);
            }
            return { success: true, message: `Deleted: ${filePath}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // نقل ملف
    async move_file({ source, destination }) {
        try {
            await fs.mkdir(path.dirname(destination), { recursive: true });
            await fs.rename(source, destination);
            return { success: true, message: `Moved: ${source} -> ${destination}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // نسخ ملف
    async copy_file({ source, destination }) {
        try {
            await fs.mkdir(path.dirname(destination), { recursive: true });
            await fs.copyFile(source, destination);
            return { success: true, message: `Copied: ${source} -> ${destination}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // تنفيذ أمر
    async execute_command({ command, cwd, shell = 'cmd' }) {
        try {
            const shellCmd = shell === 'powershell' ? 'powershell.exe' : 'cmd.exe';
            const shellArgs = shell === 'powershell' ? ['-Command', command] : ['/c', command];
            
            const { stdout, stderr } = await execPromise(command, {
                cwd: cwd || CONFIG.WORKSPACE,
                shell: shellCmd,
                timeout: 60000, // 60 ثانية
                maxBuffer: 10 * 1024 * 1024
            });
            
            return { 
                success: true, 
                stdout: stdout.trim(), 
                stderr: stderr.trim(),
                command 
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                stdout: error.stdout || '',
                stderr: error.stderr || ''
            };
        }
    },

    // أمر Git
    async git_command({ command, cwd }) {
        try {
            const { stdout, stderr } = await execPromise(`git ${command}`, {
                cwd: cwd || CONFIG.WORKSPACE,
                timeout: 120000
            });
            return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // البحث عن ملفات
    async search_files({ directory, pattern }) {
        try {
            const results = [];
            
            async function searchDir(dir) {
                const items = await fs.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
                        await searchDir(fullPath);
                    } else if (item.isFile()) {
                        // تحويل النمط إلى regex
                        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
                        if (regex.test(item.name)) {
                            results.push(fullPath);
                        }
                    }
                }
            }
            
            await searchDir(directory);
            return { success: true, files: results, count: results.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // البحث داخل الملفات
    async search_in_files({ directory, text, extension }) {
        try {
            const results = [];
            
            async function searchDir(dir) {
                const items = await fs.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
                        await searchDir(fullPath);
                    } else if (item.isFile()) {
                        if (extension && !item.name.endsWith(extension)) continue;
                        try {
                            const content = await fs.readFile(fullPath, 'utf-8');
                            const lines = content.split('\n');
                            lines.forEach((line, index) => {
                                if (line.includes(text)) {
                                    results.push({
                                        file: fullPath,
                                        line: index + 1,
                                        content: line.trim().substring(0, 200)
                                    });
                                }
                            });
                        } catch (e) {}
                    }
                }
            }
            
            await searchDir(directory);
            return { success: true, matches: results, count: results.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // معلومات النظام
    async get_system_info() {
        try {
            const os = require('os');
            return {
                success: true,
                info: {
                    platform: os.platform(),
                    release: os.release(),
                    hostname: os.hostname(),
                    cpus: os.cpus().length,
                    memory: {
                        total: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
                        free: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB'
                    },
                    homedir: os.homedir(),
                    workspace: CONFIG.WORKSPACE
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // أمر npm
    async npm_command({ command, cwd }) {
        try {
            const { stdout, stderr } = await execPromise(`npm ${command}`, {
                cwd: cwd || CONFIG.WORKSPACE,
                timeout: 300000 // 5 دقائق للتثبيت
            });
            return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // تنفيذ Python
    async python_command({ script, cwd }) {
        try {
            let command;
            if (script.endsWith('.py')) {
                command = `python "${script}"`;
            } else {
                command = `python -c "${script.replace(/"/g, '\\"')}"`;
            }
            
            const { stdout, stderr } = await execPromise(command, {
                cwd: cwd || CONFIG.WORKSPACE,
                timeout: 120000
            });
            return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ==================== نقاط النهاية (Endpoints) ====================

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.json({
        name: 'Manus MCP Server',
        version: '1.0.0',
        status: 'running',
        workspace: CONFIG.WORKSPACE,
        endpoints: [
            'GET /tools - قائمة الأدوات المتاحة',
            'POST /execute - تنفيذ أداة',
            'GET /health - حالة الخادم'
        ]
    });
});

// قائمة الأدوات (MCP Protocol)
app.get('/tools', authenticate, (req, res) => {
    res.json({ tools: TOOLS });
});

// تنفيذ أداة (MCP Protocol)
app.post('/execute', authenticate, async (req, res) => {
    const { tool, parameters } = req.body;
    
    if (!tool || !toolHandlers[tool]) {
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }
    
    try {
        console.log(`[${new Date().toISOString()}] Executing: ${tool}`, parameters);
        const result = await toolHandlers[tool](parameters || {});
        console.log(`[${new Date().toISOString()}] Result:`, result.success ? 'Success' : 'Failed');
        res.json(result);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error);
        res.status(500).json({ error: error.message });
    }
});

// فحص الصحة
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// MCP Protocol - List Tools
app.post('/mcp/tools/list', authenticate, (req, res) => {
    res.json({ tools: TOOLS });
});

// MCP Protocol - Call Tool
app.post('/mcp/tools/call', authenticate, async (req, res) => {
    const { name, arguments: args } = req.body;
    
    if (!name || !toolHandlers[name]) {
        return res.status(400).json({ error: `Unknown tool: ${name}` });
    }
    
    try {
        const result = await toolHandlers[name](args || {});
        res.json({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== بدء الخادم ====================

app.listen(CONFIG.PORT, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           Manus MCP Server - خادم MCP لـ Manus             ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Server URL: http://localhost:${CONFIG.PORT}                    ║`);
    console.log(`║  🔑 API Key: ${CONFIG.API_KEY.substring(0, 20)}...  ║`);
    console.log(`║  📁 Workspace: ${CONFIG.WORKSPACE.substring(0, 35)}...  ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  الأدوات المتاحة:                                          ║');
    console.log('║  • read_file, write_file, list_directory                  ║');
    console.log('║  • execute_command, git_command, npm_command              ║');
    console.log('║  • search_files, search_in_files                          ║');
    console.log('║  • create_directory, delete_file, move_file, copy_file    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n📋 لربط هذا الخادم بـ Manus:');
    console.log('   1. اذهب إلى Settings → Integrations → Custom MCP Servers');
    console.log('   2. أضف الخادم بالرابط أعلاه');
    console.log(`   3. استخدم API Key: ${CONFIG.API_KEY}`);
    console.log('\n⚠️  لا تشارك API Key مع أي شخص!\n');
});

// التعامل مع إيقاف الخادم
process.on('SIGINT', () => {
    console.log('\n👋 إيقاف الخادم...');
    process.exit(0);
});
