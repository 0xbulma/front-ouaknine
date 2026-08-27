import { ArrowSmRightIcon } from "@heroicons/react/outline";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ExpertiseField } from "../../libs/types";
import RichText from "../ui/rich-text";

import classes from "./expertise-fields.module.scss";

const pad = (number: number) => String(number).padStart(2, "0");

// Clears the sticky header, and matches the field's scroll-margin.
const READING_TOP = 96;

function ExpertiseFields({
	items,
	label,
	linkLabel,
	current,
}: {
	items: ExpertiseField[];
	label: string;
	linkLabel: string;
	current?: string;
}) {
	const fieldRef = useRef<HTMLElement>(null);
	const landed = useRef(false);

	const active = items.findIndex((item) => item.slug === current);
	const field = items[active >= 0 ? active : 0];

	// Every field is read from its own first line: whichever one is arrived at,
	// and however far into the last one the page had been scrolled. Not on the
	// first render, though — a page opened from a search result should start
	// where it was asked to start.
	//
	// And not while that first line is already clear of the header. The field
	// starts at a fixed offset down the document, so at the top of the page it
	// sits about 70px below the reading line: pulling it up from there scrolls a
	// page that was not scrolled, and left every field looking like it had
	// already been read into.
	useEffect(() => {
		if (!landed.current) {
			landed.current = true;
			return;
		}

		const element = fieldRef.current;
		const top = element?.getBoundingClientRect().top;
		if (!element || top === undefined || top >= READING_TOP) return;

		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		element.scrollIntoView({
			block: "start",
			behavior: reduced ? "auto" : "smooth",
		});
	}, [current]);

	return (
		<div className={classes.fields}>
			<div className={classes.rail}>
				<nav className={classes.railinner} aria-label={label}>
					{items.map((item, index) => {
						const isActive = index === active;

						return (
							<Link
								key={item.slug}
								href={`/expertise/${item.slug}`}
								scroll={false}
								className={classes.railitem}
								aria-current={isActive ? "page" : undefined}
							>
								<span className={classes.railindex}>{pad(index + 1)}</span>
								<span className={classes.railtitle}>{item.title?.trim()}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<article className={classes.field} ref={fieldRef}>
				<div key={field?.slug} className={classes.fieldinner}>
					<p className={classes.meta}>
						<span className={classes.metainner}>
							{pad((active >= 0 ? active : 0) + 1)}
							<span className={classes.metatotal}> / {pad(items.length)}</span>
						</span>
					</p>

					<div className={classes.titlemask}>
						<h1 className={classes.title}>{field?.title?.trim()}</h1>
					</div>

					<div className={classes.rule} />

					<div className={classes.body}>
						{field?.description ? (
							<div className={classes.description}>
								<RichText value={field.description} />
							</div>
						) : null}
						{field?.right ? (
							<aside className={classes.spe}>
								{field.titleSpe ? <h2 className={classes.spetitle}>{field.titleSpe}</h2> : null}
								<div className={classes.spelist}>
									<RichText value={field.right} />
								</div>
							</aside>
						) : null}
					</div>

					<Link href="/contact" className={classes.link}>
						<span>{linkLabel}</span>
						<ArrowSmRightIcon className={classes.arrow} />
					</Link>
				</div>
			</article>
		</div>
	);
}

export default ExpertiseFields;
