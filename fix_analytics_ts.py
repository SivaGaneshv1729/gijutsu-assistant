# -*- coding: utf-8 -*-
with open("frontend/src/pages/Analytics.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix lucide-react imports to include TrendingUp and remove BarChart2
content = content.replace(
    "import { BarChart2, Activity, Cpu, AlertTriangle, Zap, Server, ShieldCheck, Database, Terminal, Radio } from 'lucide-react';",
    "import { Activity, Cpu, AlertTriangle, Zap, Server, ShieldCheck, Database, Terminal, Radio, TrendingUp } from 'lucide-react';"
)

# Remove unused recharts imports
content = content.replace(
    "import {\n  AreaChart, Area, BarChart, Bar,\n  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer\n} from 'recharts';",
    "import {\n  AreaChart, Area,\n  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer\n} from 'recharts';"
)

# Remove unused useRef
content = content.replace(
    "import { useEffect, useState, useRef } from 'react';",
    "import { useEffect, useState } from 'react';"
)

# Fix unused 'i' in map
content = content.replace(
    "{logs.map((log, i) => (",
    "{logs.map((log) => ("
)

with open("frontend/src/pages/Analytics.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Analytics.tsx TypeScript errors fixed!")
