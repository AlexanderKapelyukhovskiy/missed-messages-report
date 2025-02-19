const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(__dirname, 'sessions-with-missed-messages');

function getMissedMessages(customerData, advisorData) {
    const customerReceived = new Set(customerData.receivedMessages.map(m => m.messageId));
    const advisorSent = new Set(advisorData.sentMessages.map(m => m.messageId));
    
    const customerSent = new Set(customerData.sentMessages.map(m => m.messageId));
    const advisorReceived = new Set(advisorData.receivedMessages.map(m => m.messageId));

    const missedByCustomer = [...advisorSent].filter(msg => !customerReceived.has(msg));
    const missedByAdvisor = [...customerSent].filter(msg => !advisorReceived.has(msg));
    
    return { missedByCustomer, missedByAdvisor };
}

function processSessions() {
    const sessions = fs.readdirSync(SESSIONS_DIR).filter(folder => fs.statSync(path.join(SESSIONS_DIR, folder)).isDirectory());
    const report = [];
    
    for (const sessionId of sessions) {
        const customerPath = path.join(SESSIONS_DIR, sessionId, 'customer.json');
        const advisorPath = path.join(SESSIONS_DIR, sessionId, 'advisor.json');

        if (!fs.existsSync(customerPath) || !fs.existsSync(advisorPath)) {
            console.warn(`Skipping session ${sessionId}: Missing customer.json or advisor.json`);
            continue;
        }
        
        const customerData = JSON.parse(fs.readFileSync(customerPath, 'utf8'));
        const advisorData = JSON.parse(fs.readFileSync(advisorPath, 'utf8'));

        const { missedByCustomer, missedByAdvisor } = getMissedMessages(customerData, advisorData);

        report.push({
            sessionId,
            missedByCustomer,
            missedByAdvisor
        });
    }
    
    console.log('Missed Messages Report:', JSON.stringify(report, null, 2));
}

processSessions();