import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import useCreateClient from "../hooks/use-create-client";

export function CreateClientDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const initialState = {
    name: "",
    email: "",
    phone: "",
  };
  const [client, setClient] = useState(initialState);

  const mutation = useCreateClient();

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("client", client);

    mutation.mutate(client);
    setClient(initialState);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Добавить клиента</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleCreateClient}>
          <DialogHeader>
            <DialogTitle>Добавить клиента</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                name="name"
                value={client.name}
                onChange={handleClientChange}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={client.email}
                onChange={handleClientChange}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Телефон"
                value={client.phone}
                onChange={handleClientChange}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// "use client"

// import { useState } from "react"

// import {
//  Dialog,
//  DialogContent,
//  DialogHeader,
//  DialogTitle,
//  DialogTrigger,
// } from "@/components/ui/dialog"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import useCreateClient from "../hooks/use-create-client"

// export function CreateClientDialog() {

//  const [open, setOpen] = useState(false)

//  const [name, setName] = useState("")
//  const [email, setEmail] = useState("")
//  const [phone, setPhone] = useState("")

//  const mutation = useCreateClient()

//  const handleSubmit = async (e: React.FormEvent) => {

//   e.preventDefault()

//   await mutation.mutateAsync({
//    name,
//    email,
//    phone,
//   })

//   setOpen(false)

//   setName("")
//   setEmail("")
//   setPhone("")
//  }

//  return (

//   <Dialog open={open} onOpenChange={setOpen}>

//    <DialogTrigger asChild>

//     <Button>
//      Create Client
//     </Button>

//    </DialogTrigger>

//    <DialogContent>

//     <DialogHeader>

//      <DialogTitle>
//       Create Client
//      </DialogTitle>

//     </DialogHeader>

//     <form
//      onSubmit={handleSubmit}
//      className="flex flex-col gap-4"
//     >

//      <Input
//       placeholder="Name"
//       value={name}
//       onChange={(e) => setName(e.target.value)}
//      />

//      <Input
//       placeholder="Email"
//       value={email}
//       onChange={(e) => setEmail(e.target.value)}
//      />

//      <Input
//       placeholder="Phone"
//       value={phone}
//       onChange={(e) => setPhone(e.target.value)}
//      />

//      <Button
//       type="submit"
//       disabled={mutation.isPending}
//      >
//       Create
//      </Button>

//     </form>

//    </DialogContent>

//   </Dialog>
//  )
// }
