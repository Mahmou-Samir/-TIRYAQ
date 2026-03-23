from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI(title="Tiryaq AI API", description="XGBoost Model for Sales Prediction")

# 1. السماح للـ React بالتواصل مع السيرفر بدون مشاكل CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. تحميل "عقل" الذكاء الاصطناعي
try:
    model = joblib.load('xgboost_sales_model.pkl')
    le_dict = joblib.load('label_encoders.pkl')
    print("✅ تم تحميل موديل XGBoost والمشفرات بنجاح!")
except Exception as e:
    print("❌ خطأ في تحميل الموديل، تأكد من وجود ملفات .pkl في نفس المجلد.")

# 3. تعريف شكل البيانات اللي React هيبعتها
class SalesPredictionRequest(BaseModel):
    corp_account: str
    product: str
    therapeutic_group: str
    territory: str
    item: str
    cad_fte_vets: float
    glr_quantity: float

# 4. مسار الـ API لاستقبال الطلبات والتوقع
@app.post("/api/predict-sales")
async def predict_sales_api(request: SalesPredictionRequest):
    try:
        # تحويل البيانات القادمة من React إلى DataFrame زي ما الموديل بيفهم
        input_data = pd.DataFrame({
            'Corp Account': [request.corp_account],
            'Product': [request.product],
            'Therapeutic Group': [request.therapeutic_group],
            'Territory': [request.territory],
            'Item': [request.item],
            '# CAD FTE Vets': [request.cad_fte_vets],
            'GLR Quantity': [request.glr_quantity]
        })

        cat_features = ['Corp Account', 'Product', 'Therapeutic Group', 'Territory', 'Item']

        # التشفير الآمن (Safe Encoding)
        for col in cat_features:
            le = le_dict.get(col)
            if le:
                classes = list(le.classes_)
                input_data[col] = input_data[col].astype(str).map(
                    lambda x: classes.index(x) if x in classes else -1
                )
            else:
                input_data[col] = -1

        # استخراج التوقع
        prediction = model.predict(input_data)

        return {
            "status": "success",
            "predicted_sales_usd": round(float(prediction[0]), 2)
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def read_root():
    return {"message": "Tiryaq AI Server is Running 🚀"}