with open('frontend/src/pages/AdminPanel.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# The end currently is:
#       </div>
# </div>
#     </div>
#   );
# }

# We want:
#     </div>
#   );
# }

text = text.replace('      </div>\n</div>\n    </div>\n  );\n}', '    </div>\n  );\n}')

with open('frontend/src/pages/AdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
