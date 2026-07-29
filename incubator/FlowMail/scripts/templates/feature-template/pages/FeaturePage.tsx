import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturePage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{{FEATURE_NAME}}</CardTitle>
          <CardDescription>
            Welcome to the {{FEATURE_NAME}} feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Start building your feature here!</p>
        </CardContent>
      </Card>
    </div>
  );
}
