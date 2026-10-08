import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Bot, AlertTriangle, Key, CheckCircle, RefreshCw } from 'lucide-react';

const GeminiAssistant = ({ predictionData, patientData }) => {
  const { geminiApiKey, updateGeminiApiKey } = useAuth();
  const [inputKey, setInputKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(!geminiApiKey);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      updateGeminiApiKey(inputKey.trim());
      setShowKeyInput(false);
    }
  };

  const generateInsight = async (customPrompt = null) => {
    if (!geminiApiKey) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const contextText = `
You are an expert Medical AI Assistant supporting a radiologist or neurologist reviewing an Alzheimer's MRI scan classification result.

Patient Metadata:
- Name: ${patientData?.name || predictionData?.patient_name || 'Anonymous'}
- Age: ${patientData?.age || 'N/A'}
- Gender: ${patientData?.gender || 'N/A'}

DenseNet121 Deep Learning Output:
- Predicted Classification Stage: ${predictionData?.predicted_class || 'N/A'}
- Model Confidence: ${(predictionData?.confidence * 100).toFixed(1)}%
- Probability Distribution across 4 stages:
  * NonDemented: ${((predictionData?.probabilities?.NonDemented || 0) * 100).toFixed(1)}%
  * VeryMildDemented: ${((predictionData?.probabilities?.VeryMildDemented || 0) * 100).toFixed(1)}%
  * MildDemented: ${((predictionData?.probabilities?.MildDemented || 0) * 100).toFixed(1)}%
  * ModerateDemented: ${((predictionData?.probabilities?.ModerateDemented || 0) * 100).toFixed(1)}%

User Query / Request: ${customPrompt || "Provide a concise medical analysis report explaining this predicted stage, clinical significance, differential consideration recommendations, and clear guidance on how the clinician should present this decision-support output to the patient."}

Please format your response clearly in structured markdown with headings and bullet points. Always emphasize that this output is decision support for research/clinical review and requires licensed physician validation.
`;

      const result = await model.generateContent(contextText);
      const response = await result.response;
      setAiResponse(response.text());
    } catch (err) {
      console.error("Gemini API Error:", err);
      setError(err.message || "Failed to generate AI clinical insights using Gemini API. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-slate-950/70 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Gemini Direct Frontend AI Assistant
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                Gemini 1.5 Flash
              </span>
            </h4>
            <p className="text-xs text-slate-400">Clinical decision support & natural language MRI interpretation helper</p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>{geminiApiKey ? 'Update Key' : 'Set Key'}</span>
        </button>
      </div>

      {/* API Key Modal / Form */}
      {showKeyInput && (
        <form onSubmit={handleSaveKey} className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
            <Key className="w-4 h-4" />
            <span>Frontend Gemini API Key Required</span>
          </div>
          <p className="text-xs text-slate-400">
            Enter your Google Gemini API Key below to enable direct frontend AI insights generation.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
            >
              Save Key
            </button>
          </div>
        </form>
      )}

      {/* Main Controls */}
      {!showKeyInput && (
        <div className="space-y-4">
          {!aiResponse && !loading && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => generateInsight()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate Clinical Interpretation Report
              </button>
              <button
                onClick={() => generateInsight("Explain this MRI result in plain, empathetic terms for the patient's family.")}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium transition-all"
              >
                Family-Friendly Explanation
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-indigo-500/30 text-indigo-300 text-sm animate-pulse">
              <Bot className="w-5 h-5 animate-spin" />
              <span>Gemini AI is analyzing stage metrics and generating clinical report...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {aiResponse && (
            <div className="space-y-3">
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed max-h-96 overflow-y-auto whitespace-pre-line font-sans">
                {aiResponse}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => generateInsight()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate Insight
                </button>
              </div>
            </div>
          )}

          {/* Prompt Box */}
          <div className="flex gap-2 pt-2 border-t border-slate-800/80">
            <input
              type="text"
              placeholder="Ask Gemini AI specific questions about this scan or clinical protocol..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && prompt.trim()) {
                  generateInsight(prompt);
                  setPrompt('');
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => {
                if (prompt.trim()) {
                  generateInsight(prompt);
                  setPrompt('');
                }
              }}
              disabled={loading || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;
