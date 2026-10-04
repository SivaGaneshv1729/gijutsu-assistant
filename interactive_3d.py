import re

with open('frontend/src/pages/Analytics.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update NodeStatus component signature and styles
target_node = """const NodeStatus = ({ name, load, health }: { name: string, load: number, health: 'good' | 'warn' | 'critical' }) => {
  const color = health === 'good' ? 'bg-emerald-500' : health === 'warn' ? 'bg-orange-500' : 'bg-red-500';
  const glow = health === 'good' ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : health === 'warn' ? 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';
  
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">"""

replace_node = """const NodeStatus = ({ name, load, health, onClick, active }: { name: string, load: number, health: 'good' | 'warn' | 'critical', onClick?: () => void, active?: boolean }) => {
  const color = health === 'good' ? 'bg-emerald-500' : health === 'warn' ? 'bg-orange-500' : 'bg-red-500';
  const glow = health === 'good' ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : health === 'warn' ? 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';
  const activeStyle = active ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/10';
  
  return (
    <div onClick={onClick} className={p-4 rounded-xl bg-white/5 border  transition-all duration-300 group cursor-pointer hover:-translate-y-1}>"""
content = content.replace(target_node, replace_node)

# 2. Add activeModel state
target_state = """export default function Analytics() {
  const [loading, setLoading] = useState(true);"""
replace_state = """export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState('motor');"""
content = content.replace(target_state, replace_state)

# 3. Update the Nodes usage
target_nodes_usage = """<NodeStatus name="Graph DB (Neo4j)" load={42} health="good" />
              <NodeStatus name="Vector Store (OpenSearch)" load={28} health="good" />
              <NodeStatus name="LLM Inference API" load={85} health="warn" />
              <NodeStatus name="PostgreSQL Main" load={15} health="good" />"""
replace_nodes_usage = """<NodeStatus name="Graph DB (Neo4j)" load={42} health="good" active={activeModel === 'motor'} onClick={() => setActiveModel('motor')} />
              <NodeStatus name="Vector Store (OpenSearch)" load={28} health="good" active={activeModel === 'pump'} onClick={() => setActiveModel('pump')} />
              <NodeStatus name="LLM Inference API" load={85} health="warn" active={activeModel === 'motor'} onClick={() => setActiveModel('motor')} />
              <NodeStatus name="PostgreSQL Main" load={15} health="good" active={activeModel === 'pump'} onClick={() => setActiveModel('pump')} />"""
content = content.replace(target_nodes_usage, replace_nodes_usage)

# 4. Update the ModelViewer instance
target_model = """<ModelViewer type="motor" />"""
replace_model = """<ModelViewer type={activeModel} />"""
content = content.replace(target_model, replace_model)

with open('frontend/src/pages/Analytics.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Analytics 3D interactivity implemented.")
