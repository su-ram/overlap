"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

interface ApiDocsViewerProps {
  spec: any;
}

export function ApiDocsViewer({ spec }: ApiDocsViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      get: "bg-blue-100 text-blue-700 border-blue-300",
      post: "bg-green-100 text-green-700 border-green-300",
      patch: "bg-yellow-100 text-yellow-700 border-yellow-300",
      delete: "bg-red-100 text-red-700 border-red-300",
      put: "bg-purple-100 text-purple-700 border-purple-300",
    };
    return colors[method.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const renderSchema = (schema: any, level = 0): JSX.Element | null => {
    if (!schema) return null;

    if (schema.$ref) {
      const refName = schema.$ref.split("/").pop();
      const refSchema = spec.components?.schemas?.[refName];
      if (refSchema) {
        return renderSchema(refSchema, level);
      }
      return <span className="text-blue-600">{refName}</span>;
    }

    if (schema.type === "object") {
      return (
        <div className={`ml-${level * 4} space-y-2`}>
          {schema.properties &&
            Object.entries(schema.properties).map(([key, value]: [string, any]) => (
              <div key={key} className="border-l-2 border-gray-200 pl-3 py-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-gray-800">{key}</span>
                  <span className="text-xs text-gray-500">
                    {value.type || (value.$ref ? "object" : "any")}
                    {value.nullable && " | null"}
                    {!schema.required?.includes(key) && " (optional)"}
                  </span>
                </div>
                {value.description && (
                  <p className="text-xs text-gray-600 mt-1">{value.description}</p>
                )}
                {value.type === "object" && renderSchema(value, level + 1)}
              </div>
            ))}
        </div>
      );
    }

    if (schema.type === "array") {
      return (
        <div className="ml-4">
          <span className="text-gray-600">Array of: </span>
          {renderSchema(schema.items, level)}
        </div>
      );
    }

    return <span className="text-gray-600">{schema.type}</span>;
  };

  const paths = spec.paths || {};
  const pathEntries = Object.entries(paths);

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{spec.info?.title || "API Documentation"}</h1>
        {spec.info?.description && (
          <p className="text-gray-600 text-lg">{spec.info.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>Version: {spec.info?.version || "1.0.0"}</span>
          {spec.servers?.[0] && (
            <span>Base URL: {spec.servers[0].url}</span>
          )}
        </div>
      </div>

      {/* API 엔드포인트 목록 */}
      <div className="space-y-4">
        {pathEntries.map(([path, methods]: [string, any]) => {
          const pathKey = path;
          const isExpanded = expandedPaths.has(pathKey);
          const methodEntries = Object.entries(methods);

          return (
            <div key={pathKey} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              {/* Path 헤더 */}
              <button
                onClick={() => togglePath(pathKey)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <code className="text-lg font-mono font-semibold text-gray-900">{path}</code>
                </div>
                <div className="flex items-center gap-2">
                  {methodEntries.map(([method]) => (
                    <span
                      key={method}
                      className={`px-3 py-1 rounded text-xs font-semibold uppercase border ${getMethodColor(method)}`}
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </button>

              {/* Path 상세 정보 */}
              {isExpanded && (
                <div className="px-6 py-4 space-y-6 border-t border-gray-200">
                  {methodEntries.map(([method, details]: [string, any]) => (
                    <div key={method} className="pb-6 last:pb-0 border-b border-gray-100 last:border-b-0">
                      {/* Method 헤더 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded text-sm font-semibold uppercase border ${getMethodColor(method)}`}
                          >
                            {method}
                          </span>
                          <h3 className="text-xl font-semibold text-gray-900">{details.summary || method.toUpperCase()}</h3>
                        </div>
                      </div>

                      {/* 설명 */}
                      {details.description && (
                        <p className="text-gray-600 mb-4">{details.description}</p>
                      )}

                      {/* 파라미터 */}
                      {details.parameters && details.parameters.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Parameters</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            {details.parameters.map((param: any, idx: number) => (
                              <div key={idx} className="border-l-3 border-blue-400 pl-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="font-mono text-sm font-semibold text-gray-800">
                                    {param.name}
                                  </code>
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    {param.in}
                                  </span>
                                  {param.required && (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                      required
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">{param.schema?.type}</span>
                                </div>
                                {param.description && (
                                  <p className="text-xs text-gray-600">{param.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {details.requestBody && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Body</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            {renderSchema(
                              details.requestBody.content?.["application/json"]?.schema
                            )}
                          </div>
                        </div>
                      )}

                      {/* Responses */}
                      {details.responses && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Responses</h4>
                          <div className="space-y-3">
                            {Object.entries(details.responses).map(([status, response]: [string, any]) => (
                              <div key={status} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      status.startsWith("2")
                                        ? "bg-green-100 text-green-700"
                                        : status.startsWith("4")
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {status}
                                  </span>
                                  <span className="text-sm text-gray-600">{response.description}</span>
                                </div>
                                {response.content?.["application/json"]?.schema && (
                                  <div className="mt-2 bg-white rounded p-3 border border-gray-100">
                                    {renderSchema(response.content["application/json"].schema)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 예제 요청 */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-700">Example Request</h4>
                          <button
                            onClick={() => {
                              const example = `${method.toUpperCase()} ${spec.servers?.[0]?.url || ""}${path}`;
                              copyToClipboard(example);
                            }}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                          >
                            {copiedText === `${method.toUpperCase()} ${spec.servers?.[0]?.url || ""}${path}` ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm text-green-400 font-mono">
                            {method.toUpperCase()} {spec.servers?.[0]?.url || ""}{path}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 태그별 그룹화 (선택사항) */}
      {spec.tags && spec.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {spec.tags.map((tag: any) => (
              <span
                key={tag.name}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
