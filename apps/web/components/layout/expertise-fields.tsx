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
	const railRef = useRef<HTMLDivElement>(null);
	const landed = useRef(false);

	const active = items.findIndex((item) => item.slug === current);
	const field = items[active >= 0 ? active : 0];

	// Every field is read from its own first line: whichever one is arrived at,
	// and however far into the last one the page had been scrolled. That holds for
	// a field picked from the index and for one arrived at from outside it, the
	// home page or a publication, because the URL names the field either way.
	//
	// Not, beside the index, while that first line is already clear of the header:
	// there the field is on screen whichever row is picked, and at the top of the
	// page it sits about 70px below the reading line, so pulling it up scrolls a
	// page that was not scrolled and leaves every field looking like it had
	// already been read into. Stacked, the index is above the field rather than
	// beside it and the field starts a screen further down, out of sight, so that
	// one always has to be scrolled to however it was reached.
	//
	// And not over a position the browser restored on a reload or a back, which is
	// where the reader left off rather than the top of the field.
	useEffect(() => {
		const arriving = !landed.current;
		landed.current = true;

		const element = fieldRef.current;
		const rail = railRef.current;
		if (!element || !rail) return;

		const rect = element.getBoundingClientRect();
		const beside = rail.getBoundingClientRect().right <= rect.left;

		if (arriving) {
			if (beside || window.scrollY > 0) return;
		} else if (beside && rect.top >= READING_TOP) return;

		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		element.scrollIntoView({
			block: "start",
			// An arrival is a landing position rather than a change, so it does not
			// animate: the page is simply already there.
			behavior: reduced || arriving ? "auto" : "smooth",
		});
	}, [current]);

	return (
		<div className={classes.fields}>
			<div className={classes.rail} ref={railRef}>
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
