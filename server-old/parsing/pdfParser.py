import pdfminer.high_level

text = pdfminer.high_level.extract_text('samples/a.pdf')
print(text)
