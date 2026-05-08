import DashboardHeader from "../../components/DashboardHeader"
import PaymentCards from "../../components/PaymentCards"
import RentOverview from "../../components/RentOverview"
import PaymentHistory from "../../components/PaymentHistory"
export default function Dashboard() {
  return (
    <div> 
        <DashboardHeader />
        <PaymentCards />
        <RentOverview />
        <PaymentHistory />
    </div>
    )
}    
