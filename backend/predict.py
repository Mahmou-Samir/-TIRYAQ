import pandas as pd
import joblib

def predict_sales(input_data):
    """
    التنبؤ بالمبيعات باستخدام الموديل المحفوظ
    """
    print("⏳ جاري تحميل الموديل...")
    try:
        model = joblib.load('xgboost_sales_model.pkl')
        le_dict = joblib.load('label_encoders.pkl')
    except Exception as e:
        print("❌ تأكد من تشغيل كود التدريب أولاً لوجود الملفات المحفوظة.")
        return None

    cat_features = ['Corp Account', 'Product', 'Therapeutic Group', 'Territory', 'Item']
    num_features = ['# CAD FTE Vets', 'GLR Quantity']

    # 1. التأكد من وجود كل العواميد المطلوبة
    for col in num_features:
        if col not in input_data.columns:
            input_data[col] = 0.0

    # 2. التشفير الآمن (Safe Encoding)
    for col in cat_features:
        if col in input_data.columns:
            le = le_dict.get(col)
            if le:
                # إذا كانت الكلمة موجودة في التدريب، قم بتشفيرها، وإلا ضع -1
                classes = list(le.classes_)
                input_data[col] = input_data[col].astype(str).map(
                    lambda x: classes.index(x) if x in classes else -1
                )
            else:
                input_data[col] = -1
        else:
            input_data[col] = -1

    # ترتيب العواميد لتطابق ما توقعه الموديل
    X_predict = input_data[cat_features + num_features]

    # 3. استخراج التوقع
    prediction = model.predict(X_predict)
    return prediction

if __name__ == "__main__":
    # بيانات دواء وهمية للتجربة
    new_data = pd.DataFrame({
        'Corp Account': ['Non Corp Acct'],
        'Product': ['Revolution Feline - 154'],
        'Therapeutic Group': ['Parasiticides'],
        'Territory': ['Portland N, OR - 3226'],
        'Item': ['Rev 6pk Blu Cat           - 10000321'],
        '# CAD FTE Vets': [1.0],
        'GLR Quantity': [15.0] # نفترض أننا سنبيع 15 علبة
    })
    
    pred_sales = predict_sales(new_data)
    if pred_sales is not None:
        print(f"\n💵 المبيعات المتوقعة: {pred_sales[0]:.2f} $")