import pandas as pd
import numpy as np
import random
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

print("Generating new dataset...")
df_existing = pd.read_excel('AcademiX_Grade11_ICT_Dataset.xlsx')
students = df_existing[['Student_ID', 'Student_Name']].drop_duplicates().to_dict('records')

lessons = [
    {'Lesson_ID': 'L1', 'Lesson_Name': 'Information and Communication Technology'},
    {'Lesson_ID': 'L2', 'Lesson_Name': 'Fundamentals of a Computer System'}
]

data = []
np.random.seed(42)

for student in students:
    for lesson in lessons:
        m1 = round(np.random.normal(18, 4), 2)
        m2 = round(np.random.normal(17, 5), 2)
        m3 = round(np.random.normal(19, 4), 2)
        
        m1 = max(0, min(25, m1))
        m2 = max(0, min(25, m2))
        m3 = max(0, min(25, m3))
        
        avg_score = round((m1 + m2 + m3) / 3, 2)
        
        weak_count = sum(1 for m in [m1, m2, m3] if m < 18)
        priority_score = weak_count * 10 + np.random.randint(1, 10)
        
        followup_score = round(min(25, avg_score + np.random.normal(3, 2)), 2)
        
        if avg_score > 0:
            improvement = round(((followup_score - avg_score) / avg_score) * 100, 2)
        else:
            improvement = 0
            
        if avg_score >= 20:
            lesson_perf = 'Excellent'
        elif avg_score >= 15:
            lesson_perf = 'Good'
        else:
            lesson_perf = 'Needs Improvement'
            
        quiz_diff = np.random.choice(['Easy', 'Medium', 'Hard'], p=[0.2, 0.6, 0.2])
        
        actual_exam_mark = min(100, max(0, round((followup_score / 25) * 80 + np.random.normal(10, 5), 2)))
        
        row = {
            'Student_ID': student['Student_ID'],
            'Student_Name': student['Student_Name'],
            'Lesson_ID': lesson['Lesson_ID'],
            'Lesson_Name': lesson['Lesson_Name'],
            'Module_1_Score': m1,
            'Module_2_Score': m2,
            'Module_3_Score': m3,
            'Avg_Module_Score': avg_score,
            'Weak_Module_Count': weak_count,
            'Priority_Score': priority_score,
            'Followup_Quiz_Score': followup_score,
            'Improvement_Percentage': improvement,
            'Lesson_Performance': lesson_perf,
            'Quiz_Difficulty': quiz_diff,
            'Actual_Lesson_End_Examination_Mark': actual_exam_mark
        }
        data.append(row)

df_new = pd.DataFrame(data)
df_new.to_csv('Generated_Adaptive_Dataset.csv', index=False)
print("Dataset shape:", df_new.shape)

df_features = df_new.copy()

df_features = pd.get_dummies(df_features, columns=['Lesson_ID', 'Lesson_Performance', 'Quiz_Difficulty'])

X = df_features.drop(columns=['Student_ID', 'Student_Name', 'Lesson_Name', 'Actual_Lesson_End_Examination_Mark'])
y = df_features['Actual_Lesson_End_Examination_Mark']

model_features = list(X.columns)
joblib.dump(model_features, 'model_features.pkl')
print(f"Features saved: {model_features}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

y_pred = rf_model.predict(X_test)
print("Model Evaluation:")
print("MAE:", mean_absolute_error(y_test, y_pred))
print("MSE:", mean_squared_error(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
print("R2 Score:", r2_score(y_test, y_pred))

joblib.dump(rf_model, 'term_score_predictor.pkl')
print("Model saved as term_score_predictor.pkl")
