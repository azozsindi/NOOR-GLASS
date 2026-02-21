/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export function Barcode({ value, format = "CODE128", width = 2, height = 40, displayValue = false }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value && value !== "---") {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          margin: 0
        });
      } catch (e) {
        console.error("JsBarcode error:", e);
      }
    }
  }, [value, format, width, height, displayValue]);

  if (!value || value === "---") return null;

  return <svg ref={svgRef} className="max-w-full h-auto mx-auto" />;
}
