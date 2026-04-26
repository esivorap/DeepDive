from db import get_employee_by_id

def process_ai_response(ai_response: dict) -> dict:
    chosen_ids = ai_response["chosen_ids"]
    
    # Fetch names for chosen IDs from DB
    employees = [get_employee_by_id(i) for i in chosen_ids]

    return {
        "chosen_employees": employees,
        "reasoning": ai_response["reasoning"]
    }