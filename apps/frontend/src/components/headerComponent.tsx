'use client'
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ModeToggle } from "./darkModeComponent";

const NavItem = ['Home', 'Nav1', 'Nave2'];

export default function HeaderComponent() {
  return (
    <section className="container m-auto p-4">
      <div className="flex justify-between px-10">
        <div className="flex gap-4 items-center text-xl font-semibold">
          {NavItem.map((item, index) => (
            <div key={index} className="cursor-pointer hover:underline">{item}</div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button className="cursor-pointer dark:bg-green-500 bg-blue-500 dark:hover:bg-green-700 hover:bg-blue-700 text-black dark:text-white text-xl font-semibold" onClick={() => toast("Login Successfull!")}>Login</Button>
          <ModeToggle />
        </div>
      </div>
    </section>
  )
}
