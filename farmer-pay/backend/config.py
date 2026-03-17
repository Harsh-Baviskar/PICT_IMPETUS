from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri:          str   = "mongodb://localhost:27017/farmerpay"
    algorand_node:      str   = "https://testnet-api.algonode.cloud"
    algorand_indexer:   str   = "https://testnet-idx.algonode.cloud"
    contract_app_id:    int   = 0
    pinata_api_key:     str   = ""
    pinata_secret:      str   = ""
    jwt_secret:         str   = "dev_secret_change_in_production"
    jwt_expire_hours:   int   = 24
    port:               int   = 4000
    frontend_url:       str   = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
