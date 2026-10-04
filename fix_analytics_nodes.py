import re

with open('frontend/src/pages/Analytics.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<NodeStatus name="Graph DB (Neo4j)" load={42} health="good" />
              <NodeStatus name="Vector Search (OpenSearch)" load={85} health="warn" />
              <NodeStatus name="PostgreSQL Main" load={28} health="good" />'''

replace = '''<NodeStatus name="Graph DB (Neo4j)" load={42} health="good" active={activeModel === 'motor'} onClick={() => setActiveModel('motor')} />
              <NodeStatus name="Vector Search (OpenSearch)" load={85} health="warn" active={activeModel === 'pump'} onClick={() => setActiveModel('pump')} />
              <NodeStatus name="PostgreSQL Main" load={28} health="good" active={activeModel === 'pump'} onClick={() => setActiveModel('pump')} />'''

content = content.replace(target, replace)

with open('frontend/src/pages/Analytics.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
