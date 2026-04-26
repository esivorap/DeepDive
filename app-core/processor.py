from db import get_employees_by_ids

def process_ai_response(ai_response: dict) -> dict:
    chosen_ids = ai_response["chosen_ids"]
    
    # Fetch names for chosen IDs from DB
    employees = get_employees_by_ids(chosen_ids)

    return {
        "chosen_employees": employees,
        "reasoning": ai_response["reasoning"]
    }