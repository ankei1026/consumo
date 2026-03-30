import google.generativeai as genai
import json
import os
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import PIL.Image
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class GeminiWaterLeakAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        
        genai.configure(api_key=self.api_key)
        
        model_names = ['gemini-2.5-flash']
        
        self.model = None
        for model_name in model_names:
            try:
                self.model = genai.GenerativeModel(model_name)
                # Test the model
                test_response = self.model.generate_content("Test")
                if test_response:
                    logger.info(f"Successfully initialized model: {model_name}")
                    break
            except Exception as e:
                logger.warning(f"Failed to initialize {model_name}: {e}")
                continue
        
        if not self.model:
            raise ValueError("No valid Gemini model found. Please check your API key and model availability.")
        
    def analyze_report_with_image_and_consumption(self, 
                                                   image_path: str, 
                                                   report_content: str,
                                                   consumption_data: Dict) -> Dict:
        """
        Analyze a report combining image, text content, and consumption data
        """
        try:
            # Open the image
            img = PIL.Image.open(image_path)
            
            # Create the prompt for multimodal analysis
            prompt = f"""
            Act as a Water Utility Inspector and Hydraulic Engineer.
            
            Analyze this water report that contains:
            1. A photo of a reported water issue
            2. The consumer's report text: "{report_content}"
            3. Water consumption data: {json.dumps(consumption_data, indent=2)}
            
            Please analyze and determine:
            1. Does the image show a water leak? Describe what you see.
            2. Does the consumer's report text match what's shown in the image?
            3. Is there a sudden consumption spike in the data?
            4. What is the severity of the issue (if any)?
            
            Return ONLY a valid JSON object with the following structure:
            {{
                "leak_detected": boolean,
                "leak_type": string,
                "severity": "low"|"medium"|"high"|"critical",
                "image_analysis": string,
                "text_consistency": {{
                    "matches": boolean,
                    "explanation": string
                }},
                "consumption_analysis": {{
                    "has_spike": boolean,
                    "spike_percentage": number,
                    "current_consumption": number,
                    "average_consumption": number,
                    "analysis": string
                }},
                "recommendation": string,
                "priority": "immediate"|"urgent"|"scheduled"|"monitor"
            }}
            """
            
            # Generate response with multimodal input
            response = self.model.generate_content([prompt, img])
            
            # Clean and parse JSON response
            raw_text = response.text.strip()
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].strip()
            
            result = json.loads(raw_text)
            
            # Add additional analysis based on consumption spike
            if consumption_data.get('has_spike', False):
                result['leak_detected'] = True
                result['recommendation'] = f"{result.get('recommendation', '')} Consumption spike of {consumption_data.get('spike_percentage', 0)}% detected. Immediate inspection recommended."
            
            return result
            
        except Exception as e:
            logger.error(f"AI Analysis failed: {e}")
            return self._get_fallback_analysis(consumption_data)
    
    def _get_fallback_analysis(self, consumption_data: Dict) -> Dict:
        """Provide fallback analysis when AI fails"""
        has_spike = consumption_data.get('has_spike', False)
        spike_percentage = consumption_data.get('spike_percentage', 0)
        
        return {
            "leak_detected": has_spike,
            "leak_type": "possible leak" if has_spike else "unknown",
            "severity": "medium" if has_spike else "low",
            "image_analysis": "Image analysis not available",
            "text_consistency": {
                "matches": True,
                "explanation": "Analysis performed based on consumption data only"
            },
            "consumption_analysis": {
                "has_spike": has_spike,
                "spike_percentage": spike_percentage,
                "current_consumption": consumption_data.get('current_consumption', 0),
                "average_consumption": consumption_data.get('average_consumption', 0),
                "analysis": f"Consumption {'spike' if has_spike else 'normal'} detected"
            },
            "recommendation": "Schedule inspection" if has_spike else "Monitor consumption",
            "priority": "urgent" if has_spike else "scheduled"
        }
    
    def analyze_consumption_trend(self, consumption_records: List[Dict]) -> Dict:
        """
        Analyze water consumption trend to detect anomalies
        """
        if not consumption_records:
            return {
                "has_anomaly": False,
                "analysis": "Insufficient data",
                "recommendation": "Collect more consumption data"
            }
        
        try:
            # Prepare data for analysis
            records_text = []
            for record in consumption_records[:12]:  # Last 12 records
                records_text.append(
                    f"Period: {record.get('billing_period', 'N/A')}, "
                    f"Consumption: {record.get('consumption', 0)} m³, "
                    f"Previous: {record.get('previous_reading', 0)}, "
                    f"Current: {record.get('current_reading', 0)}"
                )
            
            prompt = f"""
            Analyze the following water consumption records and identify any anomalies:
            
            {chr(10).join(records_text)}
            
            Please provide:
            1. Is there a sudden spike in consumption?
            2. What is the trend (increasing, decreasing, stable)?
            3. Identify any unusual patterns.
            4. Recommend actions if anomalies are found.
            
            Return ONLY a JSON object:
            {{
                "has_anomaly": boolean,
                "anomaly_type": string,
                "trend": string,
                "spike_detected": boolean,
                "spike_percentage": number,
                "analysis": string,
                "recommendation": string
            }}
            """
            
            response = self.model.generate_content(prompt)
            
            raw_text = response.text.strip()
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].strip()
            
            return json.loads(raw_text)
            
        except Exception as e:
            logger.error(f"Consumption trend analysis failed: {e}")
            return {
                "has_anomaly": False,
                "anomaly_type": "unknown",
                "trend": "unknown",
                "spike_detected": False,
                "spike_percentage": 0,
                "analysis": "Analysis failed",
                "recommendation": "Manual review required"
            }
    
    def calculate_consumption_spike(self, 
                                    current_consumption: float, 
                                    historical_consumptions: List[float]) -> Dict:
        """
        Calculate if there's a significant consumption spike
        """
        if not historical_consumptions:
            return {
                "has_spike": False,
                "spike_percentage": 0,
                "average_consumption": current_consumption,
                "current_consumption": current_consumption,
                "analysis": "Insufficient historical data for spike analysis"
            }
        
        avg_consumption = sum(historical_consumptions) / len(historical_consumptions)
        
        if avg_consumption > 0:
            spike_percentage = ((current_consumption - avg_consumption) / avg_consumption) * 100
        else:
            spike_percentage = 100 if current_consumption > 0 else 0
        
        has_spike = spike_percentage > 30  # 30% increase threshold
        
        return {
            "has_spike": has_spike,
            "spike_percentage": round(spike_percentage, 2),
            "average_consumption": round(avg_consumption, 2),
            "current_consumption": round(current_consumption, 2),
            "analysis": f"Consumption {'increased' if spike_percentage > 0 else 'decreased'} by {abs(round(spike_percentage, 2))}%"
        }
    
    def analyze_report(self, 
                       image_path: str, 
                       report_content: str, 
                       consumption_records: List[Dict]) -> Dict:
        """
        Main method to analyze a full report with image, text, and consumption data
        """
        try:
            # Calculate consumption spike
            current_consumption = consumption_records[0]['consumption'] if consumption_records else 0
            historical_consumptions = [r['consumption'] for r in consumption_records[1:6]] if len(consumption_records) > 1 else []
            
            spike_analysis = self.calculate_consumption_spike(current_consumption, historical_consumptions)
            
            # Prepare consumption data for multimodal analysis
            consumption_data = {
                "current_consumption": current_consumption,
                "average_consumption": spike_analysis['average_consumption'],
                "has_spike": spike_analysis['has_spike'],
                "spike_percentage": spike_analysis['spike_percentage'],
                "historical_records": [
                    {
                        "consumption": r['consumption'],
                        "period": r.get('billing_period', 'N/A')
                    } for r in consumption_records[:6]
                ]
            }
            
            # Perform multimodal analysis
            multimodal_result = self.analyze_report_with_image_and_consumption(
                image_path, report_content, consumption_data
            )
            
            # Perform consumption trend analysis if multiple records
            trend_analysis = None
            if len(consumption_records) > 3:
                trend_analysis = self.analyze_consumption_trend(consumption_records)
            
            # Combine results
            result = {
                "leak_detected": multimodal_result.get('leak_detected', False),
                "leak_type": multimodal_result.get('leak_type', 'unknown'),
                "severity": multimodal_result.get('severity', 'unknown'),
                "priority": multimodal_result.get('priority', 'scheduled'),
                "image_analysis": multimodal_result.get('image_analysis', ''),
                "text_consistency": multimodal_result.get('text_consistency', {}),
                "consumption_analysis": {
                    "has_spike": spike_analysis['has_spike'],
                    "spike_percentage": spike_analysis['spike_percentage'],
                    "current_consumption": spike_analysis['current_consumption'],
                    "average_consumption": spike_analysis['average_consumption'],
                    "analysis": spike_analysis['analysis']
                },
                "trend_analysis": trend_analysis,
                "recommendation": multimodal_result.get('recommendation', ''),
                "summary": self._generate_summary(multimodal_result, spike_analysis, trend_analysis)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Analyze report failed: {e}")
            # Return a fallback result
            return {
                "leak_detected": False,
                "leak_type": "unknown",
                "severity": "low",
                "priority": "scheduled",
                "image_analysis": "Analysis failed",
                "text_consistency": {"matches": False, "explanation": "Analysis failed"},
                "consumption_analysis": {
                    "has_spike": False,
                    "spike_percentage": 0,
                    "current_consumption": 0,
                    "average_consumption": 0,
                    "analysis": "Analysis failed"
                },
                "trend_analysis": None,
                "recommendation": "Manual inspection required",
                "summary": "⚠️ AI analysis failed. Please inspect manually."
            }
    
    def _generate_summary(self, multimodal_result: Dict, spike_analysis: Dict, trend_analysis: Dict) -> str:
        """
        Generate a human-readable summary of the analysis
        """
        leak_detected = multimodal_result.get('leak_detected', False)
        severity = multimodal_result.get('severity', 'unknown')
        
        if not leak_detected:
            summary = "🔍 **Analysis Summary**\n\n"
            summary += "No visible leak detected in the image.\n"
            
            if spike_analysis.get('has_spike', False):
                summary += f"⚠️ However, there is a **{spike_analysis['spike_percentage']}% consumption spike** detected.\n"
                summary += f"   Current consumption: {spike_analysis['current_consumption']} m³\n"
                summary += f"   Average consumption: {spike_analysis['average_consumption']} m³\n"
                summary += "\n📋 **Recommendation**: Schedule an inspection to check for hidden leaks or meter issues.\n"
            else:
                summary += "Consumption appears normal.\n"
                summary += "\n✅ **Recommendation**: Monitor consumption next billing cycle.\n"
        else:
            summary = f"⚠️ **{severity.upper()} SEVERITY ISSUE DETECTED**\n\n"
            summary += f"**Issue Type**: {multimodal_result.get('leak_type', 'Unknown leak')}\n\n"
            summary += f"**Image Analysis**: {multimodal_result.get('image_analysis', 'No analysis')}\n\n"
            
            text_match = multimodal_result.get('text_consistency', {}).get('matches', False)
            if not text_match:
                summary += "⚠️ **Note**: The report text doesn't fully match the image.\n\n"
            
            if spike_analysis.get('has_spike', False):
                summary += f"📊 **Consumption Alert**: {spike_analysis['spike_percentage']}% spike detected!\n"
                summary += f"   • Current: {spike_analysis['current_consumption']} m³\n"
                summary += f"   • Average: {spike_analysis['average_consumption']} m³\n\n"
            
            summary += f"📋 **Recommendation**: {multimodal_result.get('recommendation', 'Immediate inspection required')}\n"
        
        return summary
    
    def batch_analyze_reports(self, reports_data: List[Dict]) -> List[Dict]:
        """
        Analyze multiple reports in batch
        """
        results = []
        for report in reports_data:
            result = self.analyze_report(
                image_path=report.get('image_path'),
                report_content=report.get('content', ''),
                consumption_records=report.get('consumption_records', [])
            )
            result['report_id'] = report.get('id')
            results.append(result)
        
        return results