import google.generativeai as genai
import json
import os
import time
from typing import Dict, List, Optional
from dotenv import load_dotenv
import PIL.Image
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiWaterLeakAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_report_with_image_and_consumption(self,
                                                   image_path: str,
                                                   report_content: str,
                                                   consumption_data: Dict) -> Dict:
        """
        Multimodal analysis with File Lock fixes and Quota handling.
        """
        try:
            # FIX: Use 'with' to ensure the file handle is closed immediately after reading
            with PIL.Image.open(image_path) as img:
                # We force a load of the image data so it stays in memory after closing the file
                img.load()

                prompt = f"""
                ### SYSTEM INSTRUCTION:
                You are an expert Water Utility Inspector.
                LANGUAGE RULE: Detect language of: "{report_content}".
                Respond ONLY in that language (Cebuano, Tagalog, or English).

                ### DATA:
                Consumer Report: "{report_content}"
                Consumption Data: {json.dumps(consumption_data)}

                ### OUTPUT FORMAT (JSON ONLY):
                {{
                    "leak_detected": boolean,
                    "leak_type": "string",
                    "severity": "low"|"medium"|"high"|"critical",
                    "image_analysis": "string",
                    "recommendation": "string",
                    "summary": "Full summary with labels in the detected language",
                    "priority": "immediate"|"urgent"|"scheduled"|"monitor"
                }}
                """

                # FIX: Implement a simple retry for Quota (429) errors
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        response = self.model.generate_content([prompt, img])
                        break # Success!
                    except Exception as e:
                        if "429" in str(e) and attempt < max_retries - 1:
                            logger.warning("Quota reached. Waiting 10 seconds to retry...")
                            time.sleep(10) # Wait before retrying
                        else:
                            raise e

            raw_text = response.text.strip()
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].strip()

            return json.loads(raw_text)

        except Exception as e:
            logger.error(f"AI Analysis failed: {e}")
            return self._get_fallback_analysis(consumption_data, report_content)

    def _get_fallback_analysis(self, consumption_data: Dict, report_content: str) -> Dict:
        has_spike = consumption_data.get('has_spike', False)
        is_cebuano = any(w in report_content.lower() for w in ['naay', 'ni', 'tubig', 'guba'])

        return {
            "leak_detected": has_spike,
            "leak_type": "Check required" if not is_cebuano else "Kinahanglan susihon",
            "severity": "medium",
            "image_analysis": "Error loading analysis",
            "recommendation": "Manual inspection" if not is_cebuano else "Kinahanglan og manual nga inspeksyon",
            "summary": "⚠️ AI Error (Connection). Please check manually.",
            "priority": "urgent" if has_spike else "scheduled"
        }

    def analyze_report(self, image_path: str, report_content: str, consumption_records: List[Dict]) -> Dict:
        try:
            current_consumption = consumption_records[0]['consumption'] if consumption_records else 0
            historical = [r['consumption'] for r in consumption_records[1:6]] if len(consumption_records) > 1 else []

            avg_consumption = sum(historical) / len(historical) if historical else current_consumption
            spike_percentage = ((current_consumption - avg_consumption) / avg_consumption * 100) if avg_consumption > 0 else 0

            consumption_data = {
                "current_consumption": round(current_consumption, 2),
                "average_consumption": round(avg_consumption, 2),
                "has_spike": spike_percentage > 30,
                "spike_percentage": round(spike_percentage, 2)
            }

            return self.analyze_report_with_image_and_consumption(image_path, report_content, consumption_data)
        except Exception as e:
            logger.error(f"General Analysis failed: {e}")
            return self._get_fallback_analysis({"has_spike": False}, report_content)
