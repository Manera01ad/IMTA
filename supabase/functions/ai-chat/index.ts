import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  conversationId: string;
  message: string;
  assistantId: string;
  modelId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { conversationId, message, assistantId, modelId }: ChatRequest = await req.json();

    // Get assistant details and system prompt
    const { data: assistant } = await supabase
      .from("ai_assistants")
      .select("*, ai_models!default_model_id(*)")
      .eq("id", assistantId)
      .single();

    if (!assistant) {
      throw new Error("Assistant not found");
    }

    // Get assistant's knowledge base
    const { data: knowledgeSources } = await supabase
      .from("knowledge_sources")
      .select("*")
      .eq("assistant_id", assistantId)
      .eq("is_active", true);

    // Get conversation history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10);

    // Get model details
    const { data: model } = await supabase
      .from("ai_models")
      .select("*")
      .eq("id", modelId)
      .single();

    // Build context with knowledge base
    let contextText = "\n\n=== KNOWLEDGE BASE ===\n";
    if (knowledgeSources && knowledgeSources.length > 0) {
      knowledgeSources.forEach((source: any) => {
        contextText += `\n[${source.title}]\n${source.content}\n`;
      });
    }

    // For demo purposes, generate a simulated AI response
    // In production, you would call actual AI APIs (OpenAI, Anthropic, etc.)
    const aiResponse = await generateSimulatedResponse(
      message,
      assistant.system_prompt,
      contextText,
      history || [],
      model.name
    );

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "USER",
      content: message,
      model_used: model.model_id,
    });

    // Save AI response
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "ASSISTANT",
      content: aiResponse.content,
      reasoning: aiResponse.reasoning,
      knowledge_used: aiResponse.knowledgeUsed,
      model_used: model.model_id,
    });

    // Update conversation
    await supabase
      .from("chat_conversations")
      .update({
        total_messages: (history?.length || 0) + 2,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in AI chat:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Simulated AI response generation
// In production, replace this with actual AI API calls
async function generateSimulatedResponse(
  userMessage: string,
  systemPrompt: string,
  knowledgeBase: string,
  history: any[],
  modelName: string
) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Analyze the message
  const isQuestion = userMessage.includes("?");
  const lowerMessage = userMessage.toLowerCase();
  
  let reasoning = "";
  let content = "";
  const knowledgeUsed: string[] = [];

  // Generate reasoning based on the message type
  reasoning = `1. Analyzed user query: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"\n`;
  reasoning += `2. Model used: ${modelName} with specialized system prompt\n`;
  reasoning += `3. Considered ${history.length} previous messages for context\n`;
  
  if (lowerMessage.includes("trading") || lowerMessage.includes("stock") || lowerMessage.includes("invest")) {
    reasoning += `4. Detected financial/trading query - applying risk management principles\n`;
    reasoning += `5. Cross-referencing with institutional trading patterns\n`;
    knowledgeUsed.push("Institutional Trading Patterns", "Risk Management Principles");
    
    content = `Based on my analysis and knowledge base:\n\n`;
    content += `**Key Insights:**\n`;
    content += `- Institutional traders typically approach this differently than retail traders\n`;
    content += `- Risk management is crucial: Consider position sizing and stop-loss placement\n`;
    content += `- Multiple timeframes should be analyzed for confirmation\n\n`;
    content += `**Recommendation:**\n`;
    content += `Apply proper risk management principles. Never risk more than 2% per trade, and ensure a risk-reward ratio of at least 1:2. `;
    content += `Consider both technical and fundamental factors before making decisions.\n\n`;
    content += `**Note:** This analysis is based on general principles. Always do your own research and consider your risk tolerance.`;
  } else if (lowerMessage.includes("research") || lowerMessage.includes("analyze") || lowerMessage.includes("study")) {
    reasoning += `4. Detected research query - applying critical thinking framework\n`;
    reasoning += `5. Using structured research methodology\n`;
    knowledgeUsed.push("Research Methodology Best Practices", "Critical Thinking Framework");
    
    content = `I'll approach this systematically:\n\n`;
    content += `**Research Framework:**\n`;
    content += `1. **Define Scope:** Clearly identified the research question\n`;
    content += `2. **Multiple Sources:** Cross-referencing various information sources\n`;
    content += `3. **Critical Analysis:** Evaluating evidence quality and identifying biases\n`;
    content += `4. **Alternative Perspectives:** Considering different viewpoints\n\n`;
    content += `**Key Findings:**\n`;
    content += `Based on the available information and applying critical thinking principles, `;
    content += `I recommend considering both qualitative and quantitative approaches. `;
    content += `Always verify information from multiple reliable sources and remain open to new data.\n\n`;
    content += `**Next Steps:**\n`;
    content += `Document your findings, note any assumptions, and be prepared to revise conclusions as new information becomes available.`;
  } else if (lowerMessage.includes("data") || lowerMessage.includes("pattern") || lowerMessage.includes("trend")) {
    reasoning += `4. Detected data analysis query - applying statistical thinking\n`;
    reasoning += `5. Looking for patterns and correlations\n`;
    knowledgeUsed.push("Statistical Analysis Methods");
    
    content = `**Data Analysis Approach:**\n\n`;
    content += `1. **Pattern Recognition:** Identifying trends and anomalies in the data\n`;
    content += `2. **Statistical Significance:** Evaluating whether observed patterns are meaningful\n`;
    content += `3. **Correlation vs Causation:** Distinguishing between related factors and actual causes\n\n`;
    content += `**Insights:**\n`;
    content += `Data-driven decision making requires rigorous analysis. Consider sample size, data quality, `;
    content += `and potential confounding variables. Visualize the data to identify patterns that might not be apparent in raw numbers.\n\n`;
    content += `**Recommendation:**\n`;
    content += `Use multiple analytical techniques to validate findings. Be cautious of overfitting and ensure your conclusions are generalizable.`;
  } else {
    reasoning += `4. General inquiry - providing comprehensive response\n`;
    reasoning += `5. Applying domain expertise and structured thinking\n`;
    
    content = `Thank you for your question. Let me provide a thoughtful response:\n\n`;
    content += `Based on my specialized knowledge and analytical approach, I can help you with:
\n`;
    content += `• **In-depth Analysis:** Breaking down complex topics into understandable components\n`;
    content += `• **Reasoning Process:** Explaining the logic behind recommendations\n`;
    content += `• **Multiple Perspectives:** Considering various viewpoints and scenarios\n`;
    content += `• **Actionable Insights:** Providing practical recommendations\n\n`;
    content += `Feel free to ask follow-up questions or request clarification on any aspect. `;
    content += `I'm here to help you understand the reasoning behind every answer.`;
  }

  reasoning += `6. Generated response with clear reasoning and actionable insights\n`;
  reasoning += `7. Response quality checked for clarity, accuracy, and usefulness`;

  return {
    content,
    reasoning,
    knowledgeUsed,
  };
}
