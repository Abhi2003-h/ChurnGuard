export interface PredictRequest {
  account_length: number
  international_plan: number
  voice_mail_plan: number
  number_vmail_messages: number
  total_night_charge: number
  total_intl_calls: number
  total_intl_charge: number
  customer_service_calls: number
  total_charge: number
}

export interface PredictResponse {
  prediction: 0 | 1
  probability: number
  recommendations: string[]
}

export interface FeatureImportance {
  name: string
  importance: number
}

export interface ModelStats {
  accuracy: number
  recall: number
  precision: number
  f1: number
  feature_importances: FeatureImportance[]
  class_distribution: {
    churned: number
    not_churned: number
  }
}

export interface BatchRow {
  [key: string]: string | number
  prediction: number
  probability: number
}
