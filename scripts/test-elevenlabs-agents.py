#!/usr/bin/env python3
"""
ElevenLabs Agents Testing Script - ADMIN TEMPLATES ONLY
This script tests agents created for admin templates and verifies they are working properly.
"""

import os
import sys
import json
import requests
import time
from typing import List, Dict, Any
from pymongo import MongoClient

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  python-dotenv not installed. Please ensure XI_API_KEY and MONGODB_URI are set as environment variables.")

class AdminTemplateAgentTester:
    def __init__(self):
        self.api_key = os.getenv('XI_API_KEY')
        if not self.api_key:
            raise ValueError("XI_API_KEY environment variable is required")
            
        self.mongodb_uri = os.getenv('MONGODB_URI')
        if not self.mongodb_uri:
            raise ValueError("MONGODB_URI environment variable is required")
        
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
    def get_admin_templates_from_db(self) -> List[Dict[str, Any]]:
        """Get admin templates from MongoDB database"""
        print("🔗 Connecting to MongoDB to fetch admin templates...")
        try:
            client = MongoClient(self.mongodb_uri)
            db = client["humaneq-hr"]
            
            # Get only admin templates
            admin_templates = list(db.admin_templates.find({}))
            
            print(f"✅ Found {len(admin_templates)} admin templates in database")
            
            # Convert ObjectId to string for easier handling
            for template in admin_templates:
                template['_id'] = str(template['_id'])
            
            client.close()
            return admin_templates
            
        except Exception as e:
            print(f"❌ Error connecting to MongoDB: {str(e)}")
            return []
        
    def test_api_connection(self) -> bool:
        """Test basic API connectivity"""
        print("🔗 Testing ElevenLabs API connection...")
        try:
            response = requests.get(
                f"{self.base_url}/convai/agents",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ API connection successful!")
                return True
            elif response.status_code == 401:
                print(f"❌ API connection failed: Invalid API key")
                return False
            else:
                print(f"❌ API connection failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ API connection error: {str(e)}")
            return False
    
    def list_all_agents(self) -> List[Dict[str, Any]]:
        """List all conversational AI agents"""
        print("\n📋 Fetching all agents from ElevenLabs...")
        try:
            response = requests.get(
                f"{self.base_url}/convai/agents",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                agents = data.get('agents', [])
                print(f"✅ Found {len(agents)} total agents in ElevenLabs account")
                return agents
            else:
                print(f"❌ Failed to fetch agents: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Error fetching agents: {str(e)}")
            return []
    
    def test_agent_conversation(self, agent_id: str) -> bool:
        """Test starting a conversation with an agent"""
        try:
            response = requests.get(
                f"{self.base_url}/convai/conversation/get-signed-url",
                headers=self.headers,
                params={"agent_id": agent_id},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                signed_url = data.get('signed_url')
                return bool(signed_url)
            else:
                return False
                
        except Exception as e:
            return False
    
    def verify_admin_template_agents(self, admin_templates: List[Dict[str, Any]], all_agents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Verify that admin templates have working agents"""
        print("\n🔍 Verifying admin template agents...")
        
        agent_lookup = {agent.get('agent_id'): agent for agent in all_agents}
        results = {
            'student': {'templates': [], 'working': 0, 'total': 0},
            'company': {'templates': [], 'working': 0, 'total': 0},
            'general': {'templates': [], 'working': 0, 'total': 0}
        }
        
        # Group templates by role
        for template in admin_templates:
            role = template.get('targetRole', 'unknown')
            if role not in results:
                results[role] = {'templates': [], 'working': 0, 'total': 0}
            
            template_result = {
                'template': template,
                'has_agent': bool(template.get('agentId')),
                'agent_exists': False,
                'agent_working': False
            }
            
            print(f"\n--- Testing Template: {template.get('title', 'Unknown')} ({role} role) ---")
            
            agent_id = template.get('agentId')
            if agent_id:
                print(f"✅ Template has agent ID: {agent_id}")
                
                if agent_id in agent_lookup:
                    agent = agent_lookup[agent_id]
                    print(f"✅ Agent found in ElevenLabs account")
                    print(f"   Name: {agent.get('name', 'N/A')}")
                    template_result['agent_exists'] = True
                    
                    # Test conversation capability
                    print(f"🧪 Testing conversation capability...")
                    conversation_test = self.test_agent_conversation(agent_id)
                    template_result['agent_working'] = conversation_test
                    
                    if conversation_test:
                        print(f"✅ Agent is fully functional")
                        results[role]['working'] += 1
                    else:
                        print(f"❌ Agent has conversation issues")
                else:
                    print(f"❌ Agent NOT FOUND in ElevenLabs account")
            else:
                print(f"❌ Template has no agent ID")
            
            results[role]['templates'].append(template_result)
            results[role]['total'] += 1
        
        return results
    
    def generate_report(self, results: Dict[str, Any], all_agents: List[Dict[str, Any]]):
        """Generate comprehensive test report"""
        print("\n" + "="*70)
        print("🏁 ADMIN TEMPLATE AGENTS TEST REPORT")
        print("="*70)
        
        # Calculate totals
        total_templates = sum(role_data['total'] for role_data in results.values())
        total_working = sum(role_data['working'] for role_data in results.values())
        
        print(f"\n📊 OVERALL SUMMARY:")
        print(f"   Total Admin Templates: {total_templates}")
        print(f"   Working Agents: {total_working}")
        print(f"   Success Rate: {(total_working/total_templates*100):.1f}%" if total_templates > 0 else "N/A")
        
        # Detailed status by role
        print(f"\n📋 DETAILED STATUS BY ROLE:")
        
        for role, role_data in results.items():
            if role_data['total'] > 0:
                print(f"\n🎯 {role.upper()} TEMPLATES ({role_data['total']} total):")
                
                for i, template_result in enumerate(role_data['templates']):
                    template = template_result['template']
                    status_icon = "✅" if template_result['agent_working'] else "❌"
                    
                    print(f"   {i+1}. {status_icon} {template.get('title', 'Unknown')}")
                    print(f"      Agent ID: {template.get('agentId', 'NOT SET')}")
                    
                    if template_result['has_agent']:
                        if template_result['agent_exists']:
                            if template_result['agent_working']:
                                print(f"      Status: ✅ FULLY FUNCTIONAL")
                            else:
                                print(f"      Status: ❌ AGENT EXISTS BUT NOT WORKING")
                        else:
                            print(f"      Status: ❌ AGENT ID SET BUT NOT FOUND IN ELEVENLABS")
                    else:
                        print(f"      Status: ❌ NO AGENT ASSIGNED")
                    
                    print(f"      Questions: {len(template.get('questions', []))}")
                    print(f"      Category: {template.get('category', 'N/A')}")
                    print(f"      Difficulty: {template.get('difficulty', 'N/A')}")
                
                success_rate = (role_data['working'] / role_data['total'] * 100) if role_data['total'] > 0 else 0
                print(f"   📊 {role.upper()} Success Rate: {success_rate:.1f}% ({role_data['working']}/{role_data['total']})")
        
        # All agents in account
        admin_agent_ids = set()
        for role_data in results.values():
            for template_result in role_data['templates']:
                agent_id = template_result['template'].get('agentId')
                if agent_id:
                    admin_agent_ids.add(agent_id)
        
        print(f"\n🏢 ALL AGENTS IN ELEVENLABS ACCOUNT ({len(all_agents)} total):")
        for agent in all_agents:
            agent_id = agent.get('agent_id', 'Unknown')
            name = agent.get('name', 'Unknown')
            is_admin_agent = agent_id in admin_agent_ids
            marker = "🎯" if is_admin_agent else "📋"
            status = "(Admin Template Agent)" if is_admin_agent else "(Other Agent)"
            print(f"   {marker} {name} - {agent_id} {status}")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS:")
        if total_working == total_templates and total_templates > 0:
            print("   🎉 All admin template agents are working perfectly!")
            print("   🚀 Role-based interview system is ready!")
            print("   📊 Users can now access templates based on their roles")
        elif total_templates == 0:
            print("   ⚠️  No admin templates found in database")
            print("   📝 Create templates through admin panel first:")
            print("      1. Login as admin (admin@humaneqhr.com)")
            print("      2. Go to Admin > Templates")
            print("      3. Create templates for different roles")
            print("      4. Run add-agents-to-templates.js to create agents")
        else:
            print("   ⚠️  Some agents need attention:")
            for role, role_data in results.items():
                broken_templates = [t for t in role_data['templates'] if not t['agent_working']]
                if broken_templates:
                    print(f"      {role.upper()} role issues:")
                    for template_result in broken_templates:
                        template = template_result['template']
                        print(f"         - {template.get('title')}: {template.get('agentId', 'No agent')}")
            print("   🔧 Run add-agents-to-templates.js to fix missing agents")
            print("   📞 Contact ElevenLabs support if agents exist but don't work")
        
        print("\n" + "="*70)
    
    def run_complete_test(self):
        """Run the complete test suite"""
        print("🧪 ADMIN TEMPLATES ELEVENLABS AGENTS TEST")
        print("="*55)
        
        # Show API key info (masked)
        api_key_masked = f"{self.api_key[:8]}...{self.api_key[-4:]}" if self.api_key else "NOT SET"
        print(f"🔑 API Key: {api_key_masked}")
        
        # Test API connection
        if not self.test_api_connection():
            print("\n💡 TROUBLESHOOTING TIPS:")
            print("   1. Check if your XI_API_KEY is correct in .env file")
            print("   2. Verify the API key has 'Conversational AI' permissions")
            print("   3. Make sure the API key is not expired")
            print("\n❌ Cannot proceed without API connection")
            return
        
        # Get admin templates from database
        admin_templates = self.get_admin_templates_from_db()
        if not admin_templates:
            print("❌ No admin templates found. Create templates through admin panel first.")
            return
        
        # List all agents from ElevenLabs
        all_agents = self.list_all_agents()
        if not all_agents:
            print("❌ Cannot proceed without agent list")
            return
        
        # Verify admin template agents
        results = self.verify_admin_template_agents(admin_templates, all_agents)
        
        # Generate report
        self.generate_report(results, all_agents)

def main():
    """Main function"""
    try:
        tester = AdminTemplateAgentTester()
        tester.run_complete_test()
    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
