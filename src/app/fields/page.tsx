import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah } from "@/lib/currency"
import { db, fields } from "@/db"
import { desc } from "drizzle-orm"

async function getFields() {
  const fieldsList = await db
    .select({
      id: fields.id,
      name: fields.name,
      description: fields.description,
      pricePerHour: fields.pricePerHour,
      imageUrl: fields.imageUrl,
      createdAt: fields.createdAt,
    })
    .from(fields)
    .orderBy(desc(fields.createdAt))
  return fieldsList
}

export default async function FieldsPage() {
  const fieldsList = await getFields()

  if (fieldsList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">No Fields Available</h1>
          <p className="text-gray-600 mb-8">Check back later for available soccer fields to book.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Available Soccer Fields</h1>
        <p className="text-gray-600">Choose from our selection of quality mini soccer fields</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fieldsList.map((field) => (
          <Card key={field.id} className="overflow-hidden">
            <CardHeader className="p-0">
              {field.imageUrl && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={field.imageUrl}
                    alt={field.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="mb-2">{field.name}</CardTitle>
              <CardDescription className="mb-4">
                {field.description || "Professional mini soccer field with quality turf and facilities"}
              </CardDescription>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-green-600">
                    Harga Berdasarkan Jadwal
                  </span>
                  <div className="text-sm text-gray-500">
                    Harga berbeda per slot waktu
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Link href={`/fields/${field.id}`} className="w-full">
                <Button className="w-full">View Details & Book</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}