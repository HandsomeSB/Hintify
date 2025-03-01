const vscode = require('vscode');
const openaiService = require('../services/openaiService');
const configManager = require('../config/configManager');
const diagnosticsUtils = require('../utils/diagnostics');

// Interval handle for automatic analysis
let analysisInterval;
const DEFAULT_ANALYSIS_INTERVAL = 30000; // 30 seconds

/**
 * Start automatic code analysis at regular intervals
 * @param {vscode.ExtensionContext} context 
 */
function startAutomaticAnalysis(context) {
    const isAutomaticAnalysisEnabled = configManager.getConfig('automaticAnalysis.enabled', true);
    const interval = configManager.getConfig('automaticAnalysis.interval', DEFAULT_ANALYSIS_INTERVAL);
    
    if (isAutomaticAnalysisEnabled) {
        // Clear any existing interval just in case
        stopAutomaticAnalysis();
        
        // Set up new interval
        analysisInterval = setInterval(async () => {
            await analyzeCurrentFile(false); // Don't show progress for automatic analysis
        }, interval);
        
        // Register to clear interval on deactivation
        context.subscriptions.push({
            dispose: () => {
                stopAutomaticAnalysis();
            }
        });
    }
}

/**
 * Stop automatic code analysis
 */
function stopAutomaticAnalysis() {
    if (analysisInterval) {
        clearInterval(analysisInterval);
        analysisInterval = null;
    }
}

/**
 * Analyze the current file for potential issues
 * @param {boolean} showProgress - Whether to show progress notification
 */
async function analyzeCurrentFile(showProgress = true) {
    // Check if OpenAI is configured
    if (!openaiService.isConfigured()) {
        vscode.window.showErrorMessage('Please configure your OpenAI API key first. Use the "Hintify: Configure API Key" command.');
        return;
    }
    
    // Get active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    
    // Get current file content
    const document = editor.document;
    const fileContent = document.getText();
    const fileName = document.fileName.split('/').pop();
    const fileExtension = fileName.split('.').pop();
    
    const analysisFunction = async () => {
        try {
            const hints = await openaiService.getCodeHints(fileContent, fileName, fileExtension);
            
            if (hints && hints.length > 0) {
                // Display hints as diagnostics
                diagnosticsUtils.displayHints(hints, document);
                
                // Show notification only if this was a manual analysis
                if (showProgress) {
                    vscode.window.showInformationMessage(`Found ${hints.length} potential issues in your code.`);
                }
            } else if (showProgress) {
                vscode.window.showInformationMessage('No issues found in your code.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
        }
    };
    
    if (showProgress) {
        // Show progress indication for manual analysis
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing code...",
                cancellable: false
            },
            analysisFunction
        );
    } else {
        // Just run the analysis without progress indicator
        await analysisFunction();
    }
}

module.exports = {
    startAutomaticAnalysis,
    stopAutomaticAnalysis,
    analyzeCurrentFile
};