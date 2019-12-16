export interface User {
  user_type: string
  athlete_terms_conditions: boolean
  chosen_sports:{sport_id: number,
                 sport: string,
                 is_displayed: boolean,
                 is_chosen: boolean}[]
  city: string
  country: string
  date_of_birth: string
  email: string
  first_name: string
  id: number
  last_name: string
  linked_users: { all_teams: any[]
                  email: string
                  first_name: string
                  granted_assessment_top_categories: any[]
                  id: number
                  last_name: string
                  tagline: string
                  teams: any[]
                  profile_picture_url: string
                  user_type: string }[]
  measuring_system: string
  new_dashboard: boolean
  newsletter: boolean
  payment_status: string
  profile_complete: boolean
  profile_picture_url: string
  province_or_state: string
  referral_code: string
  schools: {id: number,
            user: number,
            gpa: string,
            school: string,
            current: boolean}[]
  team_memberships:{id: number,
                    is_private: boolean,
                    name: string,
                    organisation_id: number,
                    season: string,
                    sport: string,
                    sport_id: number,
                    tagline: string,
                    team_picture_url: string}[]
  terms_conditions: boolean
  team_ownerships: any
  tagline: string
  paymentPlan: string
  organisations: any[]
}

export interface CreditCard {
  address_city?: string
  address_country?: string
  address_line1?: string
  address_line2?: string
  address_state?: string
  address_zip?: string
  brand?: string
  cardholder_name: string
  exp_month: string
  exp_year: string
  last4: string
}

export interface AthleteNote {
  date_created: string
  doctor: string
  title: string
  files: any[]
  id: number
  links: string[]
  note: string
  only_visible_to: any[]
  owner: number
  return_to_play_type: string
  team_id: number
  team_name: string
}

export interface CoachNote {
  athlete_id: number | null
  date_created: string
  title: string
  files: any[]
  id: number
  links: string[]
  note: string
  owner: number
  owner_name: string
  team_id: number
  team_name: string | null
  only_visible_to: any[]
}

export interface SingleAss {
  assessed_id: number
  assessment_id: number
  assessor_id: number
  date_assessed: string
  id: number
  team_id: number | null
  value: number
}

export interface AssSubcategory {
  description: string
  id: number
  is_flat: boolean
  name: string
  childs: SingleAss[]
}

export interface AssCategory {
  description: string
  id: number
  is_flat: boolean
  name: string
  childs: AssSubcategory[]
}