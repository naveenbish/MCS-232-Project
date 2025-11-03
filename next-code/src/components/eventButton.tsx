'use client'
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EventButton(){
  return(
  <Button className="cursor-pointer bg-green-500 hover:bg-green-700 hover:text-white" onClick={() => toast("Event World!!!")}>Event Click Button</Button>
  )
}
