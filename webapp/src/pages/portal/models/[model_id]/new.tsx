import { ZodIssueObject, issueFormSchema } from "@/interfaces/issue-types"
import { IssueStatus } from "@prisma/client"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/router"
import { useToast } from "@/components/ui/use-toast"
import { SmallSpinner } from "@/components/ui/small-spinner"

export default function NewIssue() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof issueFormSchema>>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: IssueStatus.Open,
      tags: [{ value: "" }],
      suggested: [{ value: "" }],
    },
  })

  const createIssueMutation = trpc.issues.create.useMutation({
    onError: (error) => {
      toast({
        title: "Error creating issue",
        description: error.message,
        variant: "destructive",
      })
    },
  })
  const createSuggestionMutation =
    trpc.suggestions.createHumanSuggestions.useMutation({
      onError: (error) => {
        toast({
          title: "Error creating suggestions",
          description: error.message,
          variant: "destructive",
        })
      },
    })

  async function onSubmit(values: z.infer<typeof issueFormSchema>) {
    const createObject: z.infer<typeof ZodIssueObject> = {
      name: values.name,
      description: values.description,
      status: values.status,
      tags: values.tags.map((tag) => tag.value),
      triggerPrompt: values.triggerPrompt,
      badResponse: values.badResponse,
      modelId: router.query.model_id as string,
      reasoning: values.reasoning,
      upvotes: 0,
      downvotes: 0,
    }

    // mutate async
    const result = await createIssueMutation.mutateAsync(createObject)

    // add the suggestions
    const sugResults = await createSuggestionMutation.mutateAsync({
      issueId: result.id,
      texts: values.suggested.map((suggestion) => suggestion.value),
    })

    console.log(sugResults)

    // redirect to the issue page
    router.push(`/portal/models/${router.query.model_id}/issues/${result.id}`)
  }

  const benefits = [
    "Democratizing alignment and transparency",
    "Improving the quality and behavior of LLMs",
    "Making the world a better place",
  ]

  // tag fields
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "tags",
  })

  // suggestion fields
  const { fields: suggestionFields, append: appendSuggestion } = useFieldArray({
    control: form.control,
    name: "suggested",
  })

  return (
    <div className="justify-between flex gap-16 mb-10">
      <Card className={cn("w-[380px]")}>
        <CardHeader>
          <CardTitle>Create a new issue</CardTitle>
          <CardDescription>
            Awesome! You want to report an issue. In doing so, you will assist
            in the following:
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {benefits.map((benefit, ix) => (
            <div
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-0 last:mb-0 last:pb-0"
              key={`${benefit}-${ix}`}
            >
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{benefit}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 flex-1"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name..." {...field} />
                </FormControl>
                <FormDescription>
                  This is your public issue name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description..." {...field} />
                </FormControl>
                <FormDescription>
                  This is your public issue description.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`tags.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Tags
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && "sr-only")}>
                      Add tags to your issue to better organize it.
                    </FormDescription>
                    <FormControl>
                      <Input {...field} placeholder="Enter tag..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="mt-1"
              onClick={() => append({ value: "" })}
            >
              Add Tag
            </Button>
          </div>
          <Separator />
          <FormField
            control={form.control}
            name="triggerPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt that caused it</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the prompt that caused it..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="badResponse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bad response</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the troublesome response..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reasoning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reasoning</FormLabel>
                <FormControl>
                  <Textarea placeholder="Why is this an issue?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {suggestionFields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`suggested.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Suggestions
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && "sr-only")}>
                      Add human feedback suggestions.
                    </FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter suggestion..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="mt-1"
              onClick={() => appendSuggestion({ value: "" })}
            >
              Add Suggestion
            </Button>
          </div>
          <Button
            type="submit"
            className={cn(
              createIssueMutation.isLoading && "opacity-50 cursor-not-allowed",
              createSuggestionMutation.isLoading &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {createIssueMutation.isLoading ||
            createSuggestionMutation.isLoading ? (
              <div className="flex items-center space-x-2">
                <span>Submitting</span>
                <SmallSpinner />
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
