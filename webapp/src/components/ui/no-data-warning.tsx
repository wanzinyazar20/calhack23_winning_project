import { InfoIcon } from "lucide-react"

type Props = {
  message?: string
}

export const NoDataWarning = ({ message = "No data to display." }: Props) => {
  return (
    <div className="flex justify-center items-center gap-10 py-20 flex-col w-full">
      <InfoIcon />
      <p>{message}</p>
    </div>
  )
}

export default NoDataWarning
