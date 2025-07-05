import pandas as pd

# Создаем DataFrame с нужными данными
data = {
    "email": [f"user{i}@example.com" for i in range(3, 153)],
    "password": ["123456789"] * 150
}

df = pd.DataFrame(data)

# Сохраняем DataFrame в CSV файл
csv_path = 'C:\Users\Бутылочник\Desktop\apache-jmeter-5.6.3'
df.to_csv(csv_path, index=False)

csv_path
