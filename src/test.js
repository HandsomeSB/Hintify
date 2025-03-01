// Simple standalone test for getCodeHints functionality
require('dotenv').config();
const OpenAI = require('openai');

// Sample code to analyze
const sampleCode = `
function calculateTotal(items) {
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  
  return total;
}

// Calculate discount
function applyDiscount(total, discountPercent) {
  if (discountPercent > 100) discountPercent = 100;
  
  const discount = total * (discountPercent / 100);
  return total - discount;
}

// Process order
function processOrder(items, couponCode) {
  const total = calculateTotal(items);
  
  let discountPercent = 0;
  if (couponCode === 'SAVE20') {
    discountPercent = 20;
  } else if (couponCode = 'HALFOFF') {  // Bug: assignment instead of comparison
    discountPercent = 50;
  }
  
  const finalPrice = applyDiscount(total, discountPercent);
  console.log('Order processed. Final price: $' + finalPrice);
  
  return {
    items: items,
    subtotal: total,
    discount: discountPercent,
    total: finalPrice
  };
}
`;

// Get code hints function
async function getCodeHints(code, fileName, fileExtension) {
  // Create OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const systemPrompt = `You are a code review assistant that identifies potential issues or bugs in code without fixing them. 
  Focus on providing clear, concise hints that help the developer understand what might be wrong.
  Format your response as a JSON array of objects, where each object has:
  1. "line": the approximate line number of the issue
  2. "severity": either "info", "warning", or "error"
  3. "message": a brief description of the potential issue
  4. "hint": a helpful nudge on how to fix it without giving the exact solution
  Only include actual issues - if the code looks good, return an empty array.`;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Review this ${fileExtension} code from file ${fileName}:\n\n${code}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// Main test function
async function runTest() {
  try {
    console.log("Testing getCodeHints function...");
    const hints = await getCodeHints(sampleCode, 'example.js', 'js');
    
    console.log("\nIssues found:", hints.length);
    hints.forEach((hint, i) => {
      console.log(`\n[${i+1}] Line ${hint.line}: ${hint.severity.toUpperCase()}`);
      console.log(`    ${hint.message}`);
      console.log(`    Hint: ${hint.hint}`);
    });
  } catch (err) {
    console.error("Test failed:", err);
  }
}

// Run the test
runTest();